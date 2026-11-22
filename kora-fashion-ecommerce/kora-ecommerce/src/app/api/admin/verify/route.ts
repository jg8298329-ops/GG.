import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await verifyAdminSession();
  if (!admin) {
    return NextResponse.json({ authorized: false }, { status: 403 });
  }
  return NextResponse.json({ authorized: true, admin });
}
