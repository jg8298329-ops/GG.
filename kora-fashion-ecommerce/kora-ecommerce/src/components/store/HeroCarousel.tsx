'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageBanner } from '@/types/database';

export function HeroCarousel({ banners }: { banners: HomepageBanner[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const current = banners[active];

  return (
    <section className="relative h-[76vh] min-h-[520px] max-h-[820px] w-full overflow-hidden bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.image_url}
        alt={current.title}
        className="w-full h-full object-cover opacity-85 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/25 to-transparent" />

      <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20">
        <div className="max-w-xl text-alabaster space-y-4">
          <p className="text-[11px] uppercase tracking-editorial text-alabaster/80">
            New Season Release
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.05] tracking-tight">
            {current.title}
          </h1>
          {current.subtitle && (
            <p className="text-sm sm:text-base text-alabaster/85 leading-relaxed">
              {current.subtitle}
            </p>
          )}
          <div className="pt-2">
            <Link
              href={current.cta_link || '/shop'}
              className="inline-block px-8 py-3.5 bg-alabaster text-charcoal text-xs uppercase tracking-editorial hover:bg-stone transition-colors"
            >
              {current.cta_text || 'Explore Collection'}
            </Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActive((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-charcoal/40 text-alabaster hover:bg-charcoal/70 transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setActive((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-charcoal/40 text-alabaster hover:bg-charcoal/70 transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-6 right-8 flex items-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActive(i)}
                className={`h-1.5 transition-all ${
                  i === active ? 'w-8 bg-alabaster' : 'w-3 bg-alabaster/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
