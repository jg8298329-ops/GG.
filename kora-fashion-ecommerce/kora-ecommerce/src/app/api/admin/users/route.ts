import { NextResponse } from 'next/server';
import {
  createServiceRoleClient,
  logAdminActivity,
  verifyAdminSession,
} from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await verifyAdminSession();
  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, password, full_name, role } = await request.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Valid email and password (min 8 chars) are required.' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: authError?.message || 'Failed to create auth user' },
      { status: 500 }
    );
  }

  const { error: dbError } = await supabase.from('admin_users').insert({
    id: authUser.user.id,
    email: email.trim().toLowerCase(),
    full_name: full_name?.trim() || 'Store Manager',
    role: role || 'manager',
    is_active: true,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAdminActivity({
    admin,
    action: 'CREATE_ADMIN_USER',
    entity_type: 'admin_user',
    entity_id: authUser.user.id,
    details: { email, role },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminSession();
  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, is_active, role } = await request.json();
  if (id === admin.id && is_active === false) {
    return NextResponse.json(
      { error: 'You cannot deactivate your own account.' },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('admin_users')
    .update({ is_active, role })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
