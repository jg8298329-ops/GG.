import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import type { AdminActivityLog, Product } from '@/types/database';
import { getTotalStock } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const supabase = createServiceRoleClient();

  const [{ data: productsData }, { count: categoryCount }, { count: orderCount }, { data: logs }] =
    await Promise.all([
      supabase.from('products').select('*, product_variants(*)'),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp_orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  const products = (productsData as Product[]) ?? [];
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_published).length;
  const outOfStockProducts = products.filter(
    (p) => !p.in_stock || getTotalStock(p) === 0
  ).length;
  const newProducts = products.filter((p) => p.is_new_arrival).length;

  const stats = [
    { label: 'Total Products', value: totalProducts },
    { label: 'Published / Active', value: activeProducts },
    { label: 'Out of Stock', value: outOfStockProducts },
    { label: 'Total Categories', value: categoryCount ?? 0 },
    { label: 'New Arrivals', value: newProducts },
    { label: 'WhatsApp Orders', value: orderCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-editorial text-taupe">
            Store Overview
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl mt-1">Dashboard</h1>
        </div>
        <Link
          href="/store-control/products"
          className="px-6 py-3 bg-charcoal text-alabaster text-xs uppercase tracking-editorial text-center hover:bg-charcoal/90"
        >
          + Manage Products
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-alabaster border border-hairline p-6 space-y-2"
          >
            <p className="text-[11px] uppercase tracking-editorial text-taupe">
              {s.label}
            </p>
            <p className="font-mono text-3xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-alabaster border border-hairline p-6 space-y-4">
        <h2 className="text-xs uppercase tracking-editorial font-medium">
          Recent Activity
        </h2>
        {!logs || logs.length === 0 ? (
          <p className="text-xs text-taupe">No recent activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-hairline">
            {(logs as AdminActivityLog[]).map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
              >
                <div>
                  <span className="font-mono font-medium">{log.action}</span>
                  <span className="text-taupe"> · {log.entity_type}</span>
                  <span className="text-taupe"> by {log.admin_email}</span>
                </div>
                <span className="font-mono text-[11px] text-taupe">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
