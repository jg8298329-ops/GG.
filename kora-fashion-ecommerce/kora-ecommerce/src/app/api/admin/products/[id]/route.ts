import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  createServiceRoleClient,
  logAdminActivity,
  verifyAdminSession,
} from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServiceRoleClient();

    // Support partial quick-toggles or full edit
    const updatePayload: Record<string, unknown> = {};
    const scalarFields = [
      'name',
      'sku',
      'category_id',
      'description',
      'fabric_details',
      'gsm',
      'current_price',
      'original_price',
      'discount_percentage',
      'discount_starts_at',
      'discount_ends_at',
      'is_published',
      'is_new_arrival',
      'is_best_seller',
      'is_featured',
      'in_stock',
      'size_guide',
    ];

    for (const key of scalarFields) {
      if (key in body) {
        updatePayload[key] = body[key];
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', params.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (Array.isArray(body.images)) {
      await supabase.from('product_images').delete().eq('product_id', params.id);
      if (body.images.length > 0) {
        await supabase.from('product_images').insert(
          body.images.map(
            (img: { image_url: string; alt_text?: string; is_primary?: boolean }, idx: number) => ({
              product_id: params.id,
              image_url: img.image_url,
              alt_text: img.alt_text || body.name || '',
              display_order: idx,
              is_primary: idx === 0 || Boolean(img.is_primary),
            })
          )
        );
      }
    }

    if (Array.isArray(body.variants)) {
      await supabase.from('product_variants').delete().eq('product_id', params.id);
      if (body.variants.length > 0) {
        await supabase.from('product_variants').insert(
          body.variants.map(
            (v: { size: string; color_name: string; color_hex: string; stock_quantity: number }) => ({
              product_id: params.id,
              size: v.size.trim(),
              color_name: v.color_name.trim(),
              color_hex: v.color_hex || '#141414',
              stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
            })
          )
        );
      }
    }

    await logAdminActivity({
      admin,
      action: 'UPDATE_PRODUCT',
      entity_type: 'product',
      entity_id: params.id,
      details: updatePayload,
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('products').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminActivity({
    admin,
    action: 'DELETE_PRODUCT',
    entity_type: 'product',
    entity_id: params.id,
  });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}

/**
 * POST duplicates an existing product (including images & variants) as a draft.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: source, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('id', params.id)
    .single();

  if (error || !source) {
    return NextResponse.json({ error: 'Source product not found' }, { status: 404 });
  }

  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  const newName = `${source.name} (Copy)`;
  const { data: copy, error: copyError } = await supabase
    .from('products')
    .insert({
      name: newName,
      slug: `${slugify(source.name)}-copy-${suffix.toLowerCase()}`,
      sku: `${source.sku}-${suffix}`,
      category_id: source.category_id,
      description: source.description,
      fabric_details: source.fabric_details,
      gsm: source.gsm,
      current_price: source.current_price,
      original_price: source.original_price,
      discount_percentage: source.discount_percentage,
      is_published: false,
      is_new_arrival: source.is_new_arrival,
      is_best_seller: false,
      is_featured: false,
      in_stock: source.in_stock,
      size_guide: source.size_guide,
    })
    .select()
    .single();

  if (copyError || !copy) {
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }

  if (source.product_images?.length) {
    await supabase.from('product_images').insert(
      source.product_images.map((img: { image_url: string; alt_text: string; display_order: number; is_primary: boolean }) => ({
        product_id: copy.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        is_primary: img.is_primary,
      }))
    );
  }

  if (source.product_variants?.length) {
    await supabase.from('product_variants').insert(
      source.product_variants.map((v: { size: string; color_name: string; color_hex: string; stock_quantity: number }) => ({
        product_id: copy.id,
        size: v.size,
        color_name: v.color_name,
        color_hex: v.color_hex,
        stock_quantity: v.stock_quantity,
      }))
    );
  }

  await logAdminActivity({
    admin,
    action: 'DUPLICATE_PRODUCT',
    entity_type: 'product',
    entity_id: copy.id,
    details: { sourceId: params.id, newSku: copy.sku },
  });

  revalidatePath('/', 'layout');
  return NextResponse.json(copy, { status: 201 });
}
