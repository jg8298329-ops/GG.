import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  createServiceRoleClient,
  logAdminActivity,
  verifyAdminSession,
} from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      product_images(*),
      product_variants(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      sku,
      category_id,
      description,
      fabric_details,
      gsm,
      current_price,
      original_price,
      discount_percentage,
      discount_starts_at,
      discount_ends_at,
      is_published,
      is_new_arrival,
      is_best_seller,
      is_featured,
      in_stock,
      size_guide,
      images,
      variants,
    } = body;

    if (!name?.trim() || !sku?.trim()) {
      return NextResponse.json(
        { error: 'Product name and SKU are required.' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

    const supabase = createServiceRoleClient();
    const { data: product, error: prodError } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        sku: sku.trim().toUpperCase(),
        category_id: category_id || null,
        description: description || '',
        fabric_details: fabric_details || '',
        gsm: gsm || '',
        current_price: Number(current_price) || 0,
        original_price: original_price ? Number(original_price) : null,
        discount_percentage: Number(discount_percentage) || 0,
        discount_starts_at: discount_starts_at || null,
        discount_ends_at: discount_ends_at || null,
        is_published: Boolean(is_published),
        is_new_arrival: Boolean(is_new_arrival),
        is_best_seller: Boolean(is_best_seller),
        is_featured: Boolean(is_featured),
        in_stock: in_stock !== false,
        size_guide: Array.isArray(size_guide) ? size_guide : [],
      })
      .select()
      .single();

    if (prodError || !product) {
      return NextResponse.json(
        { error: prodError?.message || 'Failed to create product' },
        { status: 500 }
      );
    }

    if (Array.isArray(images) && images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((img: { image_url: string; alt_text?: string; is_primary?: boolean }, idx: number) => ({
          product_id: product.id,
          image_url: img.image_url,
          alt_text: img.alt_text || name,
          display_order: idx,
          is_primary: idx === 0 || Boolean(img.is_primary),
        }))
      );
    }

    if (Array.isArray(variants) && variants.length > 0) {
      await supabase.from('product_variants').insert(
        variants.map(
          (v: { size: string; color_name: string; color_hex: string; stock_quantity: number }) => ({
            product_id: product.id,
            size: v.size.trim(),
            color_name: v.color_name.trim(),
            color_hex: v.color_hex || '#141414',
            stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
          })
        )
      );
    }

    await logAdminActivity({
      admin,
      action: 'CREATE_PRODUCT',
      entity_type: 'product',
      entity_id: product.id,
      details: { name: product.name, sku: product.sku },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid product payload' }, { status: 400 });
  }
}
