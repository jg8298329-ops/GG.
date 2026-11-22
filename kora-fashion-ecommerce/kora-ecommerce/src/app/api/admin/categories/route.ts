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
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: body.name.trim(),
      slug: body.slug ? slugify(body.slug) : slugify(body.name),
      description: body.description || null,
      image_url: body.image_url || null,
      display_order: Number(body.display_order) || 0,
      is_active: body.is_active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminActivity({
    admin,
    action: 'CREATE_CATEGORY',
    entity_type: 'category',
    entity_id: data.id,
    details: { name: data.name },
  });

  revalidatePath('/', 'layout');
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('categories')
    .update({
      name: body.name?.trim(),
      slug: body.slug ? slugify(body.slug) : undefined,
      description: body.description,
      image_url: body.image_url,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active,
    })
    .eq('id', body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminActivity({
    admin,
    action: 'UPDATE_CATEGORY',
    entity_type: 'category',
    entity_id: body.id,
  });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminActivity({
    admin,
    action: 'DELETE_CATEGORY',
    entity_type: 'category',
    entity_id: id,
  });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
