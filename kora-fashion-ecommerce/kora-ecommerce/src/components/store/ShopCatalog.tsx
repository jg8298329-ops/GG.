'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Category, Product } from '@/types/database';
import { getEffectivePricing, getTotalStock } from '@/lib/utils';
import { ProductCard } from '@/components/store/ProductCard';

export function ShopCatalog({
  products,
  categories,
  currencySymbol,
}: {
  products: Product[];
  categories: Category[];
  currencySymbol: string;
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category?.slug === selectedCategory);
    }

    if (selectedFilter === 'new') {
      list = list.filter((p) => p.is_new_arrival);
    } else if (selectedFilter === 'bestseller') {
      list = list.filter((p) => p.is_best_seller);
    } else if (selectedFilter === 'sale') {
      list = list.filter((p) => getEffectivePricing(p).hasActiveDiscount);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.in_stock && getTotalStock(p) > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.gsm.toLowerCase().includes(q) ||
          p.fabric_details.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => getEffectivePricing(a).price - getEffectivePricing(b).price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => getEffectivePricing(b).price - getEffectivePricing(a).price);
    }

    return list;
  }, [products, selectedCategory, selectedFilter, inStockOnly, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="border-b border-hairline pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-editorial text-taupe mb-2">
            Complete Archive
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal">
            {selectedCategory === 'all'
              ? 'All Garments'
              : categories.find((c) => c.slug === selectedCategory)?.name ?? 'Collection'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, GSM, SKU..."
            className="border border-hairline bg-alabaster px-3.5 py-2 text-xs focus:outline-none focus:border-charcoal w-56"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
            className="border border-hairline bg-alabaster px-3.5 py-2 text-xs focus:outline-none focus:border-charcoal"
          >
            <option value="newest">Sort: Latest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category & Quick Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs uppercase tracking-editorial border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-charcoal text-alabaster border-charcoal'
                : 'border-hairline hover:border-charcoal'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 text-xs uppercase tracking-editorial border transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-charcoal text-alabaster border-charcoal'
                  : 'border-hairline hover:border-charcoal'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Everything' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'bestseller', label: 'Best Sellers' },
            { id: 'sale', label: 'On Sale' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-editorial border transition-colors ${
                selectedFilter === f.id
                  ? 'border-charcoal bg-stone'
                  : 'border-transparent text-taupe hover:text-charcoal'
              }`}
            >
              {f.label}
            </button>
          ))}
          <label className="inline-flex items-center gap-2 text-xs text-taupe ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-charcoal"
            />
            In Stock Only
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-hairline bg-stone/30">
          <p className="font-serif text-2xl mb-2">No garments match your filters</p>
          <p className="text-xs text-taupe mb-6">
            Try clearing your search or selecting a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedFilter('all');
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="px-6 py-2.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} currencySymbol={currencySymbol} />
          ))}
        </div>
      )}
    </div>
  );
}
