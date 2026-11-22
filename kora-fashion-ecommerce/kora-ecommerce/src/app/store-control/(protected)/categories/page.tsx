'use client';

import { useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { Category } from '@/types/database';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [notice, setNotice] = useState('');

  const loadCategories = async () => {
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'categories');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok && data.url) setImageUrl(data.url);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        image_url: imageUrl,
        display_order: Number(displayOrder) || 0,
      }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
      setImageUrl('');
      setNotice('Category added.');
      loadCategories();
    }
  };

  const handleOrderChange = async (cat: Category, nextOrder: number) => {
    await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id, display_order: nextOrder }),
    });
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    loadCategories();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-editorial text-taupe">Navigation</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">Categories</h1>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-600 text-emerald-800 text-xs">
          {notice}
        </div>
      )}

      <form onSubmit={handleCreate} className="bg-alabaster border border-hairline p-6 space-y-4 text-xs">
        <h2 className="uppercase tracking-editorial font-medium">Add New Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name (e.g. Jackets)"
            className="border border-hairline px-3 py-2.5"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className="border border-hairline px-3 py-2.5"
          />
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="Order (1, 2...)"
            className="border border-hairline px-3 py-2.5 font-mono"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone border border-hairline cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload Category Image
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {imageUrl && <span className="text-emerald-700">Image ready</span>}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-charcoal text-alabaster uppercase tracking-editorial"
          >
            Create Category
          </button>
        </div>
      </form>

      <div className="bg-alabaster border border-hairline divide-y divide-hairline">
        {categories.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              {c.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt={c.name} className="w-12 h-14 object-cover bg-stone" />
              )}
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-taupe font-mono">/{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-taupe">Order:</label>
              <input
                type="number"
                defaultValue={c.display_order}
                onBlur={(e) => handleOrderChange(c, Number(e.target.value))}
                className="w-16 border border-hairline px-2 py-1 font-mono"
              />
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-2 text-crimson border border-hairline hover:border-crimson"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
