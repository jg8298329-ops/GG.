import Link from 'next/link';
import type { Product } from '@/types/database';
import {
  formatPrice,
  getEffectivePricing,
  getPrimaryImage,
  getTotalStock,
} from '@/lib/utils';

export function ProductCard({
  product,
  currencySymbol = '৳',
}: {
  product: Product;
  currencySymbol?: string;
}) {
  const pricing = getEffectivePricing(product);
  const primaryImage = getPrimaryImage(product);
  const totalStock = getTotalStock(product);
  const isOutOfStock = !product.in_stock || totalStock === 0;

  // Deduplicate colors
  const uniqueColors = Array.from(
    new Map(
      (product.product_variants ?? []).map((v) => [v.color_name, v.color_hex])
    ).entries()
  );

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-stone overflow-hidden mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Top-left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOutOfStock ? (
            <span className="bg-charcoal/90 text-alabaster text-[10px] uppercase tracking-editorial px-2.5 py-1">
              Sold Out
            </span>
          ) : (
            <>
              {pricing.hasActiveDiscount && (
                <span className="bg-crimson text-alabaster text-[10px] uppercase tracking-editorial px-2.5 py-1">
                  -{pricing.discountPercentage}%
                </span>
              )}
              {product.is_new_arrival && (
                <span className="bg-alabaster/95 text-charcoal text-[10px] uppercase tracking-editorial px-2.5 py-1 border border-hairline">
                  New
                </span>
              )}
              {product.is_best_seller && (
                <span className="bg-charcoal text-alabaster text-[10px] uppercase tracking-editorial px-2.5 py-1">
                  Best Seller
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-charcoal group-hover:text-taupe transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="font-medium text-charcoal">
              {formatPrice(pricing.price, currencySymbol)}
            </span>
            {pricing.originalPrice && (
              <span className="text-xs text-taupe line-through">
                {formatPrice(pricing.originalPrice, currencySymbol)}
              </span>
            )}
          </div>

          {/* Color indicators */}
          {uniqueColors.length > 0 && (
            <div className="flex items-center gap-1">
              {uniqueColors.slice(0, 4).map(([name, hex]) => (
                <span
                  key={name}
                  title={name}
                  className="w-3 h-3 rounded-full border border-hairline"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-taupe">
          {product.gsm ? `${product.gsm} · ` : ''}
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </p>
      </div>
    </Link>
  );
}
