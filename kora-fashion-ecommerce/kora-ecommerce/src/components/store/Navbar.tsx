'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Category, SiteSettings } from '@/types/database';

export function Navbar({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-alabaster/95 backdrop-blur border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 text-charcoal hover:text-taupe transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Left Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-editorial">
          <Link href="/shop" className="hover:text-taupe transition-colors">
            Shop All
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="hover:text-taupe transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Center Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt={settings.brand_name}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-medium uppercase">
              {settings.brand_name}
            </span>
          )}
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/shop?filter=sale"
            className="hidden sm:inline-block text-xs uppercase tracking-editorial text-crimson hover:opacity-75 transition-opacity"
          >
            Archive Sale
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="p-1.5 text-charcoal hover:text-taupe transition-colors"
            aria-label="Search products"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openDrawer}
            className="relative flex items-center gap-2 text-xs uppercase tracking-editorial hover:text-taupe transition-colors"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="font-mono text-[11px] bg-charcoal text-alabaster px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-hairline bg-alabaster px-4 py-3">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-taupe shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hoodies, drop-shoulder tees, GSM, SKU..."
              autoFocus
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-taupe"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-taupe hover:text-charcoal"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-alabaster h-full p-6 flex flex-col justify-between z-10 border-r border-hairline">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-hairline">
                <span className="font-serif text-xl tracking-[0.2em] uppercase">
                  {settings.brand_name}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-taupe hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-4 text-sm uppercase tracking-editorial">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-taupe"
                >
                  Shop All
                </Link>
                <Link
                  href="/shop?filter=new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-taupe"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/shop?filter=bestseller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-taupe"
                >
                  Best Sellers
                </Link>
                <Link
                  href="/shop?filter=sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-crimson"
                >
                  Archive Sale
                </Link>
                <div className="pt-4 border-t border-hairline">
                  <p className="text-[11px] text-taupe mb-3">Categories</p>
                  <div className="flex flex-col gap-3">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs hover:text-taupe"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
            <div className="pt-6 border-t border-hairline text-xs text-taupe">
              <p>{settings.brand_tagline}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
