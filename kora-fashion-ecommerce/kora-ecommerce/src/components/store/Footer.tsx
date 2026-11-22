'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category, SiteSettings } from '@/types/database';

export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activePolicy, setActivePolicy] = useState<{ title: string; body: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-charcoal text-alabaster border-t border-hairline/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <span className="font-serif text-2xl tracking-[0.22em] uppercase block">
            {settings.brand_name}
          </span>
          <p className="text-xs text-alabaster/70 leading-relaxed max-w-xs">
            {settings.brand_tagline}
          </p>
          <p className="text-xs text-alabaster/60">{settings.address}</p>
        </div>

        {/* Shop Categories */}
        <div>
          <h4 className="text-[11px] uppercase tracking-editorial text-alabaster/50 mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-alabaster/80">
            <li>
              <Link href="/shop" className="hover:text-alabaster transition-colors">
                All Products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="hover:text-alabaster transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Client Care & Policies */}
        <div>
          <h4 className="text-[11px] uppercase tracking-editorial text-alabaster/50 mb-4">
            Client Care
          </h4>
          <ul className="space-y-2.5 text-xs text-alabaster/80">
            <li>
              <button
                type="button"
                onClick={() =>
                  setActivePolicy({ title: 'Delivery Information', body: settings.delivery_info })
                }
                className="hover:text-alabaster transition-colors text-left"
              >
                Delivery Information
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  setActivePolicy({ title: 'Return & Exchange Policy', body: settings.return_policy })
                }
                className="hover:text-alabaster transition-colors text-left"
              >
                Return & Exchange Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  setActivePolicy({ title: 'Privacy Policy', body: settings.privacy_policy })
                }
                className="hover:text-alabaster transition-colors text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  setActivePolicy({ title: 'Terms & Conditions', body: settings.terms_policy })
                }
                className="hover:text-alabaster transition-colors text-left"
              >
                Terms & Conditions
              </button>
            </li>
            <li className="pt-2 text-alabaster/60">{settings.contact_phone}</li>
            <li className="text-alabaster/60">{settings.contact_email}</li>
          </ul>
        </div>

        {/* Newsletter & Social */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-editorial text-alabaster/50">
            Private Dispatch
          </h4>
          <p className="text-xs text-alabaster/70 leading-relaxed">
            Receive early access to capsule drops and limited archive releases.
          </p>
          <form onSubmit={handleSubscribe} className="flex border-b border-alabaster/30 pb-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-transparent text-xs w-full focus:outline-none placeholder:text-alabaster/40"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="text-[11px] uppercase tracking-editorial text-alabaster hover:opacity-75 shrink-0 ml-2"
            >
              {status === 'loading' ? '...' : 'Join'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-[11px] text-emerald-300">Thank you for subscribing.</p>
          )}
          {status === 'error' && (
            <p className="text-[11px] text-red-300">Unable to subscribe right now.</p>
          )}

          <div className="flex items-center gap-5 pt-3 text-xs uppercase tracking-editorial text-alabaster/70">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-alabaster">
                Instagram
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-alabaster">
                Facebook
              </a>
            )}
            {settings.tiktok_url && (
              <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-alabaster">
                TikTok
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-alabaster/10 py-6 px-4 text-center text-[11px] text-alabaster/50 tracking-wider">
        © {new Date().getFullYear()} {settings.brand_name}. All rights reserved.
      </div>

      {/* Policy Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-alabaster text-charcoal max-w-lg w-full p-8 border border-hairline shadow-xl space-y-4">
            <h3 className="font-serif text-2xl">{activePolicy.title}</h3>
            <p className="text-sm text-taupe leading-relaxed whitespace-pre-line">
              {activePolicy.body}
            </p>
            <button
              type="button"
              onClick={() => setActivePolicy(null)}
              className="mt-4 px-6 py-2.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
