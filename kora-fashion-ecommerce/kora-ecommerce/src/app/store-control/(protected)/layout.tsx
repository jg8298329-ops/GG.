import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/supabase/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await verifyAdminSession();

  if (!admin) {
    redirect('/store-control/login');
  }

  return (
    <div className="min-h-screen bg-stone/30 flex flex-col lg:flex-row">
      <AdminSidebar admin={admin} />
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full">{children}</main>
    </div>
  );
}
