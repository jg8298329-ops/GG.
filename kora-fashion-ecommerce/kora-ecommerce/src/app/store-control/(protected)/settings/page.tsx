'use client';

import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import type { SiteSettings } from '@/types/database';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'branding');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok && data.url) {
      setSettings({ ...settings, logo_url: data.url });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setNotice('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) setNotice('Website settings saved and updated live.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p className="text-xs text-taupe">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-editorial text-taupe">Configuration</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">Website Settings</h1>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-600 text-emerald-800 text-xs">
          {notice}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-alabaster border border-hairline p-6 sm:p-8 space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Brand Name</label>
            <input
              type="text"
              value={settings.brand_name}
              onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Tagline</label>
            <input
              type="text"
              value={settings.brand_tagline}
              onChange={(e) => setSettings({ ...settings, brand_tagline: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">
              WhatsApp Order Number (with country code, no +)
            </label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              placeholder="8801700000000"
              className="w-full border border-hairline px-3 py-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Currency Symbol</label>
            <input
              type="text"
              value={settings.currency_symbol}
              onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">
              Inside Dhaka Delivery Charge
            </label>
            <input
              type="number"
              value={settings.delivery_charge_inside_dhaka}
              onChange={(e) =>
                setSettings({ ...settings, delivery_charge_inside_dhaka: Number(e.target.value) })
              }
              className="w-full border border-hairline px-3 py-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">
              Outside Dhaka Delivery Charge
            </label>
            <input
              type="number"
              value={settings.delivery_charge_outside_dhaka}
              onChange={(e) =>
                setSettings({ ...settings, delivery_charge_outside_dhaka: Number(e.target.value) })
              }
              className="w-full border border-hairline px-3 py-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Contact Email</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Contact Phone</label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Instagram URL</label>
            <input
              type="url"
              value={settings.instagram_url ?? ''}
              onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Facebook URL</label>
            <input
              type="url"
              value={settings.facebook_url ?? ''}
              onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-hairline pt-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone border border-hairline cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload Brand Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          {settings.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="Logo" className="h-8 object-contain" />
          )}
        </div>

        <div className="space-y-4 border-t border-hairline pt-4">
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Brand Story Title</label>
            <input
              type="text"
              value={settings.brand_story_title}
              onChange={(e) => setSettings({ ...settings, brand_story_title: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Brand Story Body</label>
            <textarea
              rows={3}
              value={settings.brand_story_body}
              onChange={(e) => setSettings({ ...settings, brand_story_body: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Delivery Information</label>
            <textarea
              rows={2}
              value={settings.delivery_info}
              onChange={(e) => setSettings({ ...settings, delivery_info: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-taupe mb-1.5">Return & Exchange Policy</label>
            <textarea
              rows={2}
              value={settings.return_policy}
              onChange={(e) => setSettings({ ...settings, return_policy: e.target.value })}
              className="w-full border border-hairline px-3 py-2.5"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-charcoal text-alabaster uppercase tracking-editorial disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
