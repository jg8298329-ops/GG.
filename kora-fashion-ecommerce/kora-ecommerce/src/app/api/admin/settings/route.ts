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
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...body, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminActivity({
    admin,
    action: 'UPDATE_SITE_SETTINGS',
    entity_type: 'site_settings',
    entity_id: '1',
  });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
