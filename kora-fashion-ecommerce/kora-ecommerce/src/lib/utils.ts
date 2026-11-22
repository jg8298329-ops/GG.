import type { Product, CartItem, SiteSettings } from '@/types/database';

export function formatPrice(amount: number, currencySymbol = '৳'): string {
  return `${currencySymbol}${Math.round(amount).toLocaleString('en-US')}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Computes effective price & discount respecting scheduled discount dates.
 */
export function getEffectivePricing(product: Product): {
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  hasActiveDiscount: boolean;
} {
  const now = Date.now();
  const startsAt = product.discount_starts_at ? new Date(product.discount_starts_at).getTime() : null;
  const endsAt = product.discount_ends_at ? new Date(product.discount_ends_at).getTime() : null;

  const isWithinSchedule =
    (!startsAt || now >= startsAt) &&
    (!endsAt || now <= endsAt);

  if (
    isWithinSchedule &&
    product.original_price &&
    product.original_price > product.current_price
  ) {
    const pct =
      product.discount_percentage > 0
        ? product.discount_percentage
        : Math.round(((product.original_price - product.current_price) / product.original_price) * 100);
    return {
      price: product.current_price,
      originalPrice: product.original_price,
      discountPercentage: pct,
      hasActiveDiscount: pct > 0,
    };
  }

  // If discount window expired and original_price exists, fall back to original_price
  if (!isWithinSchedule && product.original_price && product.original_price > product.current_price) {
    return {
      price: product.original_price,
      originalPrice: null,
      discountPercentage: 0,
      hasActiveDiscount: false,
    };
  }

  return {
    price: product.current_price,
    originalPrice: null,
    discountPercentage: 0,
    hasActiveDiscount: false,
  };
}

export function getPrimaryImage(product: Product): string {
  const imgs = product.product_images ?? [];
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  return (
    primary?.image_url ??
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
  );
}

export function getTotalStock(product: Product): number {
  if (!product.in_stock) return 0;
  const variants = product.product_variants ?? [];
  if (variants.length === 0) return product.in_stock ? 1 : 0;
  return variants.reduce((sum, v) => sum + Math.max(0, v.stock_quantity), 0);
}

export function buildWhatsAppOrderUrl(params: {
  whatsappNumber: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryRegion: 'inside_dhaka' | 'outside_dhaka';
  district: string;
  thanaArea: string;
  fullAddress: string;
  orderNotes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  settings: Pick<SiteSettings, 'brand_name' | 'currency_symbol'>;
}): string {
  const cur = params.settings.currency_symbol || '৳';
  const regionLabel =
    params.deliveryRegion === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';

  const itemLines = params.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (${item.sku})\n` +
        `   Size: ${item.size} | Color: ${item.colorName} | Qty: ${item.quantity}\n` +
        `   Price: ${formatPrice(item.price * item.quantity, cur)}`
    )
    .join('\n');

  const message = [
    `*NEW ORDER — ${params.settings.brand_name}*`,
    `Order Ref: #${params.orderCode}`,
    ``,
    `*ITEMS ORDERED:*`,
    itemLines,
    ``,
    `*ORDER SUMMARY:*`,
    `Subtotal: ${formatPrice(params.subtotal, cur)}`,
    `Delivery (${regionLabel}): ${formatPrice(params.deliveryCharge, cur)}`,
    `*Total Payable: ${formatPrice(params.totalAmount, cur)}*`,
    ``,
    `*CUSTOMER DETAILS:*`,
    `Name: ${params.customerName}`,
    `Phone: ${params.customerPhone}`,
    `District/City: ${params.district}`,
    `Area/Thana: ${params.thanaArea}`,
    `Address: ${params.fullAddress}`,
    params.orderNotes ? `Notes: ${params.orderNotes}` : null,
    ``,
    `_Please confirm availability and delivery timeline. Thank you!_`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const cleanPhone = params.whatsappNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
