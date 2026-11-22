'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer({ currencySymbol = '৳' }: { currencySymbol?: string }) {
  const {
    items,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-charcoal/45 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />
      <aside className="relative z-10 w-full max-w-md bg-alabaster h-full flex flex-col border-l border-hairline shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4" />
            <h2 className="text-xs uppercase tracking-editorial font-medium">
              Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1 text-taupe hover:text-charcoal transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-hairline">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-taupe/40 mb-4 stroke-[1.25]" />
              <p className="font-serif text-xl mb-2">Your bag is empty</p>
              <p className="text-xs text-taupe mb-6 max-w-xs">
                Explore our heavyweight tees, boxy hoodies, and tailored essentials.
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="px-6 py-3 bg-charcoal text-alabaster text-xs uppercase tracking-editorial hover:bg-charcoal/90 transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.colorName}`}
                className="py-5 first:pt-0 flex gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-24 object-cover bg-stone shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeDrawer}
                        className="text-sm font-medium leading-snug hover:underline truncate"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size, item.colorName)}
                        className="text-taupe hover:text-crimson transition-colors p-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-taupe mt-1">
                      Size: <span className="text-charcoal">{item.size}</span> · Color:{' '}
                      <span className="text-charcoal">{item.colorName}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center border border-hairline">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.colorName,
                            item.quantity - 1
                          )
                        }
                        className="p-1.5 hover:bg-stone transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-mono">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.colorName,
                            item.quantity + 1
                          )
                        }
                        className="p-1.5 hover:bg-stone transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-mono text-sm font-medium">
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-hairline bg-stone/40 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-taupe">Subtotal</span>
              <span className="font-mono text-base font-medium">
                {formatPrice(subtotal, currencySymbol)}
              </span>
            </div>
            <p className="text-[11px] text-taupe">
              Delivery charges (Inside / Outside Dhaka) calculated at WhatsApp checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full text-center py-3.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial hover:bg-charcoal/90 transition-colors"
            >
              Proceed to WhatsApp Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
