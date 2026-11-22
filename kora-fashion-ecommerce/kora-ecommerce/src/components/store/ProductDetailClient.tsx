'use client';

import { useMemo, useState } from 'react';
import { Check, MessageCircle, Minus, Plus, Ruler, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product, SiteSettings } from '@/types/database';
import { formatPrice, getEffectivePricing } from '@/lib/utils';

export function ProductDetailClient({
  product,
  settings,
}: {
  product: Product;
  settings: SiteSettings;
}) {
  const { addItem } = useCart();
  const images = product.product_images ?? [];
  const variants = product.product_variants ?? [];
  const pricing = getEffectivePricing(product);

  const [activeImage, setActiveImage] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Unique colors & sizes
  const colors = useMemo(
    () =>
      Array.from(
        new Map(variants.map((v) => [v.color_name, v.color_hex])).entries()
      ).map(([name, hex]) => ({ name, hex })),
    [variants]
  );

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '');
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  const activeVariant = useMemo(
    () =>
      variants.find(
        (v) => v.color_name === selectedColor && v.size === selectedSize
      ),
    [variants, selectedColor, selectedSize]
  );

  const variantStock = product.in_stock
    ? activeVariant
      ? activeVariant.stock_quantity
      : variants.length === 0
      ? 10
      : 0
    : 0;

  const isAvailable = variantStock > 0;
  const primaryImg =
    images[activeImage]?.image_url ??
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80';

  const handleAddToBag = () => {
    if (!isAvailable) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      imageUrl: images[0]?.image_url ?? primaryImg,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      size: selectedSize || 'Standard',
      colorName: selectedColor || 'Default',
      colorHex: activeVariant?.color_hex ?? '#141414',
      quantity: Math.min(quantity, variantStock),
      maxStock: variantStock,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleDirectWhatsApp = () => {
    if (!isAvailable) return;
    const cur = settings.currency_symbol || '৳';
    const cleanPhone = settings.whatsapp_number.replace(/[^\d]/g, '');
    const msg = [
      `*DIRECT PRODUCT INQUIRY / ORDER — ${settings.brand_name}*`,
      `Product: ${product.name}`,
      `SKU: ${product.sku}`,
      `Size: ${selectedSize || 'Standard'}`,
      `Color: ${selectedColor || 'Default'}`,
      `Quantity: ${quantity}`,
      `Unit Price: ${formatPrice(pricing.price, cur)}`,
      `Subtotal: ${formatPrice(pricing.price * quantity, cur)}`,
      ``,
      `Please let me know availability and delivery details.`,
    ].join('\n');

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] bg-stone overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImg}
              alt={images[activeImage]?.alt_text || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[3/4] bg-stone overflow-hidden border transition-all ${
                    activeImage === idx ? 'border-charcoal' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-hairline pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="text-[11px] uppercase tracking-editorial text-taupe">
                  {product.category.name}
                </span>
              )}
              <span className="text-[11px] font-mono text-taupe">· SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-2">
              <span className="font-mono text-2xl font-medium">
                {formatPrice(pricing.price, settings.currency_symbol)}
              </span>
              {pricing.originalPrice && (
                <>
                  <span className="font-mono text-base text-taupe line-through">
                    {formatPrice(pricing.originalPrice, settings.currency_symbol)}
                  </span>
                  <span className="bg-crimson text-alabaster text-[10px] uppercase tracking-editorial px-2 py-0.5">
                    Save {pricing.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            <p className="text-xs pt-1">
              Status:{' '}
              {isAvailable ? (
                <span className="text-emerald-700 font-medium">
                  In Stock ({variantStock} available)
                </span>
              ) : (
                <span className="text-crimson font-medium">Out of Stock</span>
              )}
            </p>
          </div>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-editorial text-taupe">Color</span>
                <span className="font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.name);
                      setQuantity(1);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 border text-xs transition-colors ${
                      selectedColor === c.name
                        ? 'border-charcoal bg-stone'
                        : 'border-hairline hover:border-taupe'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-hairline"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-editorial text-taupe">Size</span>
                {product.size_guide && product.size_guide.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-charcoal underline underline-offset-4 hover:text-taupe"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Size Guide
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                  const v = variants.find(
                    (item) => item.size === size && item.color_name === selectedColor
                  );
                  const sizeInStock = product.in_stock && (v ? v.stock_quantity > 0 : false);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`py-2.5 text-xs font-mono border transition-colors ${
                        selectedSize === size
                          ? 'bg-charcoal text-alabaster border-charcoal'
                          : sizeInStock
                          ? 'border-hairline hover:border-charcoal'
                          : 'border-hairline text-taupe/50 line-through bg-stone/40'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-hairline h-12">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 h-full hover:bg-stone transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-mono text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, variantStock), q + 1))}
                  className="px-3.5 h-full hover:bg-stone transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleAddToBag}
                className="flex-1 h-12 bg-charcoal text-alabaster text-xs uppercase tracking-editorial flex items-center justify-center gap-2 hover:bg-charcoal/90 disabled:bg-taupe/40 disabled:cursor-not-allowed transition-colors"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {isAvailable ? 'Add to Shopping Bag' : 'Out of Stock'}
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              disabled={!isAvailable}
              onClick={handleDirectWhatsApp}
              className="w-full h-12 border border-charcoal text-charcoal text-xs uppercase tracking-editorial flex items-center justify-center gap-2 hover:bg-stone disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Direct WhatsApp Order
            </button>
          </div>

          {/* Fabric & Description Details */}
          <div className="border-t border-hairline pt-6 space-y-4 text-sm">
            <div>
              <h3 className="text-[11px] uppercase tracking-editorial text-taupe mb-1.5">
                Description
              </h3>
              <p className="text-charcoal/85 leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-stone/50 p-4 border border-hairline">
              <div>
                <p className="text-[10px] uppercase tracking-editorial text-taupe">Fabric</p>
                <p className="text-xs font-medium mt-1">
                  {product.fabric_details || 'Combed Organic Cotton'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-editorial text-taupe">
                  Fabric Weight
                </p>
                <p className="text-xs font-mono font-medium mt-1">
                  {product.gsm || 'Heavyweight'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-alabaster max-w-lg w-full p-6 sm:p-8 border border-hairline shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl">Size Guide</h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="p-1 text-taupe hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline text-taupe uppercase tracking-wider">
                    <th className="py-2.5 pr-4">Size</th>
                    {product.size_guide[0]?.chest && <th className="py-2.5 pr-4">Chest</th>}
                    {product.size_guide[0]?.waist && <th className="py-2.5 pr-4">Waist</th>}
                    {product.size_guide[0]?.length && <th className="py-2.5 pr-4">Length</th>}
                    {product.size_guide[0]?.shoulder && <th className="py-2.5">Shoulder</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {product.size_guide.map((row) => (
                    <tr key={row.size}>
                      <td className="py-2.5 pr-4 font-semibold">{row.size}</td>
                      {row.chest && <td className="py-2.5 pr-4">{row.chest}</td>}
                      {row.waist && <td className="py-2.5 pr-4">{row.waist}</td>}
                      {row.length && <td className="py-2.5 pr-4">{row.length}</td>}
                      {row.shoulder && <td className="py-2.5">{row.shoulder}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
