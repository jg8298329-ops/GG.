import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  createServiceRoleClient,
  logAdminActivity,
  verifyAdminSession,
} from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceRoleClient();
  const [{ data: banners }, { data: announcements }] = await Promise.all([
    supabase.from('homepage_banners').select('*').order('display_order', { ascending: true }),
    supabase.from('announcements').select('*').order('display_order', { ascending: true }),
  ]);

  return NextResponse.json({ banners: banners ?? [], announcements: announcements ?? [] });
}

export async function POST(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createServiceRoleClient();

  if (body.type === 'announcement') {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        message: body.message,
        link_url: body.link_url || null,
        display_order: Number(body.display_order) || 0,
        is_active: body.is_active !== false,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAdminActivity({ admin, action: 'CREATE_ANNOUNCEMENT', entity_type: 'announcement', entity_id: data.id });
    revalidatePath('/', 'layout');
    return NextResponse.json(data, { status: 201 });
  }

  const { data, error } = await supabase
    .from('homepage_banners')
    .insert({
      title: body.title,
      subtitle: body.subtitle || null,
      cta_text: body.cta_text || 'Explore Collection',
      cta_link: body.cta_link || '/shop',
      image_url: body.image_url,
      placement: body.placement || 'hero',
      display_order: Number(body.display_order) || 0,
      is_active: body.is_active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminActivity({ admin, action: 'CREATE_BANNER', entity_type: 'banner', entity_id: data.id });
  revalidatePath('/', 'layout');
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createServiceRoleClient();

  if (body.type === 'announcement') {
    const { error } = await supabase
      .from('announcements')
      .update({
        message: body.message,
        link_url: body.link_url,
        is_active: body.is_active,
      })
      .eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from('homepage_banners')
    .update({
      title: body.title,
      subtitle: body.subtitle,
      cta_text: body.cta_text,
      cta_link: body.cta_link,
      image_url: body.image_url,
      placement: body.placement,
      is_active: body.is_active,
    })
    .eq('id', body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'banner';
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServiceRoleClient();
  const table = type === 'announcement' ? 'announcements' : 'homepage_banners';
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
