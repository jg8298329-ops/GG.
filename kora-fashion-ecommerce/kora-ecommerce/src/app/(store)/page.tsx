import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  getActiveBanners,
  getActiveCategories,
  getPublishedProducts,
  getSiteSettings,
} from '@/lib/queries';
import { getEffectivePricing } from '@/lib/utils';
import { HeroCarousel } from '@/components/store/HeroCarousel';
import { ProductCard } from '@/components/store/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, banners, categories, products] = await Promise.all([
    getSiteSettings(),
    getActiveBanners(),
    getActiveCategories(),
    getPublishedProducts(),
  ]);

  const heroBanners = banners.filter((b) => b.placement === 'hero');
  const promoBanners = banners.filter((b) => b.placement === 'promo_strip');

  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);
  const featured = products.filter((p) => p.is_featured).slice(0, 4);
  const discounted = products
    .filter((p) => getEffectivePricing(p).hasActiveDiscount)
    .slice(0, 4);

  return (
    <div>
      {/* 1. Hero Section */}
      <HeroCarousel banners={heroBanners} />

      {/* 2. Categories / Featured Collections */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-editorial text-taupe mb-2">
                Curated Silhouettes
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-editorial flex items-center gap-2 hover:text-taupe transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-[3/4] bg-stone overflow-hidden"
              >
                {cat.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-alabaster">
                  <h3 className="font-serif text-xl">{cat.name}</h3>
                  <p className="text-[10px] uppercase tracking-editorial text-alabaster/80 mt-0.5">
                    Explore
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-hairline">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-editorial text-taupe mb-2">
                Just Landed
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop?filter=new"
              className="text-xs uppercase tracking-editorial flex items-center gap-2 hover:text-taupe transition-colors"
            >
              Shop New <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {newArrivals.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currencySymbol={settings.currency_symbol}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Optional Promotional Banner */}
      {promoBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative h-64 sm:h-80 bg-charcoal overflow-hidden flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={promoBanners[0].image_url}
              alt={promoBanners[0].title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 px-8 sm:px-14 max-w-xl text-alabaster space-y-3">
              <h3 className="font-serif text-3xl sm:text-4xl">{promoBanners[0].title}</h3>
              {promoBanners[0].subtitle && (
                <p className="text-xs sm:text-sm text-alabaster/85">
                  {promoBanners[0].subtitle}
                </p>
              )}
              <Link
                href={promoBanners[0].cta_link || '/shop'}
                className="inline-block mt-2 px-6 py-3 bg-alabaster text-charcoal text-xs uppercase tracking-editorial"
              >
                {promoBanners[0].cta_text || 'Shop Now'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-hairline">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-editorial text-taupe mb-2">
                Most Requested
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/shop?filter=bestseller"
              className="text-xs uppercase tracking-editorial flex items-center gap-2 hover:text-taupe transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currencySymbol={settings.currency_symbol}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Featured Collection */}
      {featured.length > 0 && (
        <section className="bg-stone/50 border-y border-hairline py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] uppercase tracking-editorial text-taupe mb-2">
                  Atelier Selection
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal">
                  Featured Essentials
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-editorial flex items-center gap-2 hover:text-taupe transition-colors"
              >
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currencySymbol={settings.currency_symbol}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Discounted Products */}
      {discounted.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-editorial text-crimson mb-2">
                Limited Time Offers
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal">
                Archive & Seasonal Offers
              </h2>
            </div>
            <Link
              href="/shop?filter=sale"
              className="text-xs uppercase tracking-editorial flex items-center gap-2 hover:text-taupe transition-colors"
            >
              View Offers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {discounted.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currencySymbol={settings.currency_symbol}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. Brand Story */}
      <section className="border-t border-hairline bg-alabaster py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="text-[11px] uppercase tracking-editorial text-taupe">
            Our Philosophy
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
            {settings.brand_story_title}
          </h2>
          <p className="text-sm sm:text-base text-taupe leading-relaxed">
            {settings.brand_story_body}
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 border border-charcoal text-xs uppercase tracking-editorial hover:bg-charcoal hover:text-alabaster transition-colors"
            >
              Discover the Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
