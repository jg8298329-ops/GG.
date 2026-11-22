'use client';

import { useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { Announcement, HomepageBanner } from '@/types/database';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [placement, setPlacement] = useState<'hero' | 'promo_strip'>('hero');
  const [imageUrl, setImageUrl] = useState('');

  const [announcementMsg, setAnnouncementMsg] = useState('');

  const loadAll = async () => {
    const res = await fetch('/api/admin/banners');
    if (res.ok) {
      const data = await res.json();
      setBanners(data.banners);
      setAnnouncements(data.announcements);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'banners');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok && data.url) setImageUrl(data.url);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'banner',
        title,
        subtitle,
        cta_text: ctaText,
        cta_link: ctaLink,
        placement,
        image_url: imageUrl,
      }),
    });
    if (res.ok) {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      loadAll();
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'announcement',
        message: announcementMsg,
        link_url: '/shop',
      }),
    });
    if (res.ok) {
      setAnnouncementMsg('');
      loadAll();
    }
  };

  const handleDelete = async (id: string, type: 'banner' | 'announcement') => {
    await fetch(`/api/admin/banners?id=${id}&type=${type}`, { method: 'DELETE' });
    loadAll();
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-editorial text-taupe">Visual Merchandising</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">Homepage & Banners</h1>
      </div>

      {/* Add Banner */}
      <form onSubmit={handleAddBanner} className="bg-alabaster border border-hairline p-6 space-y-4 text-xs">
        <h2 className="uppercase tracking-editorial font-medium">Add Hero or Promotional Banner</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Banner Headline"
            className="border border-hairline px-3 py-2.5"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle"
            className="border border-hairline px-3 py-2.5"
          />
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="Button Text"
            className="border border-hairline px-3 py-2.5"
          />
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as 'hero' | 'promo_strip')}
            className="border border-hairline px-3 py-2.5 bg-alabaster"
          >
            <option value="hero">Hero Carousel</option>
            <option value="promo_strip">Mid-Page Promo Strip</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone border border-hairline cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload Banner Photo
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {imageUrl && <span className="text-emerald-700">Image uploaded</span>}
          <button
            type="submit"
            disabled={!imageUrl}
            className="ml-auto px-6 py-2.5 bg-charcoal text-alabaster uppercase tracking-editorial disabled:opacity-40"
          >
            Save Banner
          </button>
        </div>
      </form>

      {/* Active Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-alabaster border border-hairline overflow-hidden flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image_url} alt={b.title} className="h-44 w-full object-cover" />
            <div className="p-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-taupe">{b.placement}</span>
                <p className="font-medium text-sm">{b.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(b.id, 'banner')}
                className="p-2 text-crimson border border-hairline"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div className="bg-alabaster border border-hairline p-6 space-y-4 text-xs">
        <h2 className="uppercase tracking-editorial font-medium">Top Announcement Bar Messages</h2>
        <form onSubmit={handleAddAnnouncement} className="flex gap-3">
          <input
            type="text"
            required
            value={announcementMsg}
            onChange={(e) => setAnnouncementMsg(e.target.value)}
            placeholder="e.g. WINTER DROP 2026 — FREE EXCHANGE WITHIN 7 DAYS"
            className="flex-1 border border-hairline px-3 py-2.5"
          />
          <button type="submit" className="px-6 py-2.5 bg-charcoal text-alabaster uppercase tracking-editorial">
            Add
          </button>
        </form>
        <div className="divide-y divide-hairline">
          {announcements.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-4">
              <span>{a.message}</span>
              <button
                type="button"
                onClick={() => handleDelete(a.id, 'announcement')}
                className="text-crimson"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
