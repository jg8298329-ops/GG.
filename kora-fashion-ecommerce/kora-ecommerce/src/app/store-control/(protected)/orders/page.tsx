'use client';

import { useEffect, useState } from 'react';
import type { WhatsAppOrder } from '@/types/database';
import { formatPrice } from '@/lib/utils';

const STATUSES = ['pending_whatsapp', 'confirmed', 'dispatched', 'delivered', 'cancelled'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);

  const loadOrders = async () => {
    const res = await fetch('/api/admin/orders');
    if (res.ok) setOrders(await res.json());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-editorial text-taupe">Sales Log</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">WhatsApp Orders</h1>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-alabaster border border-hairline p-10 text-center text-xs text-taupe">
            No WhatsApp checkout orders recorded yet.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-alabaster border border-hairline p-6 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
                <div>
                  <span className="font-mono font-semibold text-sm">#{order.order_code}</span>
                  <span className="text-taupe ml-3">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-hairline px-3 py-1.5 bg-alabaster uppercase tracking-wider text-[11px]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="uppercase tracking-wider text-taupe text-[10px]">Customer</p>
                  <p className="font-medium text-sm">{order.customer_name}</p>
                  <p className="font-mono">{order.customer_phone}</p>
                  <p className="text-taupe">
                    {order.full_address}, {order.thana_area}, {order.district} (
                    {order.delivery_region === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                  </p>
                  {order.order_notes && (
                    <p className="italic text-taupe">Note: {order.order_notes}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="uppercase tracking-wider text-taupe text-[10px]">Items</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.name} ({item.size}, {item.colorName}) × {item.quantity}
                      </span>
                      <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-hairline pt-2 flex justify-between font-medium">
                    <span>Total (incl. {formatPrice(order.delivery_charge)} delivery)</span>
                    <span className="font-mono">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
