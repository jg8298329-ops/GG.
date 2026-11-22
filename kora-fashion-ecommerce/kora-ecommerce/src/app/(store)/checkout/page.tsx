'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { SiteSettings } from '@/types/database';
import { buildWhatsAppOrderUrl, formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryRegion, setDeliveryRegion] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thanaArea, setThanaArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderCode: string;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const cur = settings?.currency_symbol ?? '৳';
  const insideCharge = Number(settings?.delivery_charge_inside_dhaka ?? 70);
  const outsideCharge = Number(settings?.delivery_charge_outside_dhaka ?? 130);
  const deliveryCharge = deliveryRegion === 'inside_dhaka' ? insideCharge : outsideCharge;
  const totalAmount = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryRegion,
          district,
          thanaArea,
          fullAddress,
          orderNotes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not process checkout. Please try again.');
        setSubmitting(false);
        return;
      }

      const whatsappUrl = buildWhatsAppOrderUrl({
        whatsappNumber: settings?.whatsapp_number ?? '8801700000000',
        orderCode: data.orderCode,
        customerName,
        customerPhone,
        deliveryRegion,
        district,
        thanaArea,
        fullAddress,
        orderNotes,
        items,
        subtotal: data.subtotal,
        deliveryCharge: data.deliveryCharge,
        totalAmount: data.totalAmount,
        settings: {
          brand_name: settings?.brand_name ?? 'KORA',
          currency_symbol: cur,
        },
      });

      setCompletedOrder({ orderCode: data.orderCode, whatsappUrl });
      clearCart();
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-14 h-14 mx-auto bg-charcoal text-alabaster rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6" />
        </div>
        <p className="text-[11px] uppercase tracking-editorial text-taupe">
          Reference #{completedOrder.orderCode}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl">
          Send Your Order on WhatsApp
        </h1>
        <p className="text-sm text-taupe leading-relaxed max-w-md mx-auto">
          Your formatted order message has been prepared. Please click Send inside WhatsApp.{' '}
          <strong className="text-charcoal font-medium">
            Your order is not confirmed until our team verifies stock and replies on WhatsApp.
          </strong>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href={completedOrder.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial hover:bg-charcoal/90"
          >
            Open WhatsApp Chat <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/shop"
            className="px-8 py-3.5 border border-hairline text-xs uppercase tracking-editorial hover:border-charcoal"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
        <ShoppingBag className="w-10 h-10 mx-auto text-taupe/40 stroke-[1.25]" />
        <h1 className="font-serif text-3xl">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-taupe">
          Add garments to your bag before proceeding to WhatsApp checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-editorial text-taupe mb-2">
          Direct Concierge Ordering
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl">WhatsApp Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-crimson/10 border border-crimson text-crimson text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tariqul Islam"
                className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 017XXXXXXXX"
                className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
          </div>

          {/* Delivery Region */}
          <div>
            <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
              Delivery Region *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setDeliveryRegion('inside_dhaka');
                  setDistrict('Dhaka');
                }}
                className={`p-4 border text-left transition-colors ${
                  deliveryRegion === 'inside_dhaka'
                    ? 'border-charcoal bg-stone'
                    : 'border-hairline hover:border-taupe'
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider">Inside Dhaka</p>
                <p className="font-mono text-sm mt-1">{formatPrice(insideCharge, cur)}</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeliveryRegion('outside_dhaka');
                  if (district === 'Dhaka') setDistrict('');
                }}
                className={`p-4 border text-left transition-colors ${
                  deliveryRegion === 'outside_dhaka'
                    ? 'border-charcoal bg-stone'
                    : 'border-hairline hover:border-taupe'
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider">Outside Dhaka</p>
                <p className="font-mono text-sm mt-1">{formatPrice(outsideCharge, cur)}</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
                District / City *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Dhaka / Rajshahi / Chattogram"
                className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
                Area / Thana *
              </label>
              <input
                type="text"
                required
                value={thanaArea}
                onChange={(e) => setThanaArea(e.target.value)}
                placeholder="e.g. Banani / Boalia"
                className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
              Full Delivery Address *
            </label>
            <textarea
              required
              rows={3}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="House no, road no, flat/floor, nearby landmark"
              className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-2">
              Order Notes (Optional)
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Preferred delivery time or special instructions"
              className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-charcoal text-alabaster text-xs uppercase tracking-editorial flex items-center justify-center gap-2 hover:bg-charcoal/90 disabled:opacity-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {submitting ? 'Preparing Order...' : 'Place Order via WhatsApp'}
          </button>

          <p className="text-[11px] text-taupe leading-relaxed">
            No online payment required now. Clicking above prepares your WhatsApp message to our
            store team. You must manually send the message in WhatsApp; orders are confirmed only
            after our team replies.
          </p>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-stone/50 border border-hairline p-6 sm:p-8 space-y-6 sticky top-24">
            <h2 className="text-xs uppercase tracking-editorial font-medium pb-4 border-b border-hairline">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.colorName}`}
                  className="flex items-center gap-3 text-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-16 object-cover bg-stone shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-taupe mt-0.5">
                      {item.size} · {item.colorName} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-medium">
                    {formatPrice(item.price * item.quantity, cur)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-hairline pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-taupe">
                <span>Subtotal</span>
                <span className="font-mono text-charcoal">{formatPrice(subtotal, cur)}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>
                  Delivery ({deliveryRegion === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="font-mono text-charcoal">{formatPrice(deliveryCharge, cur)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-3 border-t border-hairline">
                <span>Total Payable</span>
                <span className="font-mono">{formatPrice(totalAmount, cur)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
