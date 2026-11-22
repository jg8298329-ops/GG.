import { createClient } from '@supabase/supabase-js';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import type { AdminUser } from '@/types/database';

/**
 * Server-only admin client using Service Role Key.
 * NEVER import this file in client components.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase server credentials');
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verifies the current request belongs to an active admin user.
 * Returns the AdminUser record or null.
 */
export async function verifyAdminSession(): Promise<AdminUser | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const adminClient = createServiceRoleClient();
  const { data: adminRecord } = await adminClient
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  return adminRecord as AdminUser | null;
}

export async function logAdminActivity(params: {
  admin: AdminUser;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const adminClient = createServiceRoleClient();
    await adminClient.from('admin_activity_logs').insert({
      admin_id: params.admin.id,
      admin_email: params.admin.email,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id ?? null,
      details: params.details ?? {},
    });
  } catch {
    // Non-blocking audit log
  }
}
