import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { getEffectivePricing } from '@/lib/utils';
import type { CartItem, Product } from '@/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      deliveryRegion,
      district,
      thanaArea,
      fullAddress,
      orderNotes,
      items,
    } = body as {
      customerName: string;
      customerPhone: string;
      deliveryRegion: 'inside_dhaka' | 'outside_dhaka';
      district: string;
      thanaArea: string;
      fullAddress: string;
      orderNotes?: string;
      items: CartItem[];
    };

    if (
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !district?.trim() ||
      !thanaArea?.trim() ||
      !fullAddress?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Please complete all required delivery fields.' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch authoritative site settings and product prices from DB
    const [{ data: settings }, { data: dbProducts }] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase
        .from('products')
        .select('*')
        .in(
          'id',
          items.map((i) => i.productId)
        )
        .eq('is_published', true),
    ]);

    const productMap = new Map(
      ((dbProducts as Product[]) ?? []).map((p) => [p.id, p])
    );

    let subtotal = 0;
    const verifiedItems: CartItem[] = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) continue;
      const pricing = getEffectivePricing(dbProduct);
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      subtotal += pricing.price * qty;
      verifiedItems.push({
        ...item,
        price: pricing.price,
        quantity: qty,
      });
    }

    if (verifiedItems.length === 0) {
      return NextResponse.json({ error: 'No valid products in bag.' }, { status: 400 });
    }

    const deliveryCharge =
      deliveryRegion === 'inside_dhaka'
        ? Number(settings?.delivery_charge_inside_dhaka ?? 70)
        : Number(settings?.delivery_charge_outside_dhaka ?? 130);

    const totalAmount = subtotal + deliveryCharge;
    const orderCode = `KORA-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const { error: insertError } = await supabase.from('whatsapp_orders').insert({
      order_code: orderCode,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      delivery_region: deliveryRegion,
      district: district.trim(),
      thana_area: thanaArea.trim(),
      full_address: fullAddress.trim(),
      order_notes: orderNotes?.trim() || null,
      items: verifiedItems,
      subtotal,
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      status: 'pending_whatsapp',
    });

    if (insertError) {
      return NextResponse.json({ error: 'Failed to record order.' }, { status: 500 });
    }

    return NextResponse.json({
      orderCode,
      subtotal,
      deliveryCharge,
      totalAmount,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }
}
