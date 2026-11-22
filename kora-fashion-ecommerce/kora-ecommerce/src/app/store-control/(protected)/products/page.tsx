'use client';

import { useEffect, useState } from 'react';
import { Copy, Edit, Plus, Trash2, Upload, X } from 'lucide-react';
import type { Category, Product } from '@/types/database';
import { formatPrice, getPrimaryImage, getTotalStock } from '@/lib/utils';

interface VariantDraft {
  size: string;
  color_name: string;
  color_hex: string;
  stock_quantity: number;
}

interface ImageDraft {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [gsm, setGsm] = useState('');
  const [currentPrice, setCurrentPrice] = useState('0');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPct, setDiscountPct] = useState('0');
  const [discountStarts, setDiscountStarts] = useState('');
  const [discountEnds, setDiscountEnds] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([
    { size: 'M', color_name: 'Onyx Black', color_hex: '#141414', stock_quantity: 10 },
    { size: 'L', color_name: 'Onyx Black', color_hex: '#141414', stock_quantity: 10 },
  ]);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSku('');
    setCategoryId(categories[0]?.id ?? '');
    setDescription('');
    setFabricDetails('100% Combed Organic Cotton');
    setGsm('260 GSM');
    setCurrentPrice('690');
    setOriginalPrice('');
    setDiscountPct('0');
    setDiscountStarts('');
    setDiscountEnds('');
    setIsPublished(true);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setIsFeatured(false);
    setInStock(true);
    setImages([]);
    setVariants([
      { size: 'M', color_name: 'Onyx Black', color_hex: '#141414', stock_quantity: 15 },
      { size: 'L', color_name: 'Onyx Black', color_hex: '#141414', stock_quantity: 15 },
      { size: 'XL', color_name: 'Onyx Black', color_hex: '#141414', stock_quantity: 10 },
    ]);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.category_id ?? '');
    setDescription(p.description);
    setFabricDetails(p.fabric_details);
    setGsm(p.gsm);
    setCurrentPrice(String(p.current_price));
    setOriginalPrice(p.original_price ? String(p.original_price) : '');
    setDiscountPct(String(p.discount_percentage));
    setDiscountStarts(p.discount_starts_at ? p.discount_starts_at.slice(0, 16) : '');
    setDiscountEnds(p.discount_ends_at ? p.discount_ends_at.slice(0, 16) : '');
    setIsPublished(p.is_published);
    setIsNewArrival(p.is_new_arrival);
    setIsBestSeller(p.is_best_seller);
    setIsFeatured(p.is_featured);
    setInStock(p.in_stock);
    setImages(
      (p.product_images ?? []).map((img) => ({
        image_url: img.image_url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
      }))
    );
    setVariants(
      (p.product_variants ?? []).map((v) => ({
        size: v.size,
        color_name: v.color_name,
        color_hex: v.color_hex,
        stock_quantity: v.stock_quantity,
      }))
    );
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'products');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          setImages((prev) => [
            ...prev,
            { image_url: data.url, alt_text: name || file.name, is_primary: prev.length === 0 },
          ]);
        } else {
          showNotice('err', data.error || 'Upload failed');
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        sku,
        category_id: categoryId || null,
        description,
        fabric_details: fabricDetails,
        gsm,
        current_price: Number(currentPrice) || 0,
        original_price: originalPrice ? Number(originalPrice) : null,
        discount_percentage: Number(discountPct) || 0,
        discount_starts_at: discountStarts ? new Date(discountStarts).toISOString() : null,
        discount_ends_at: discountEnds ? new Date(discountEnds).toISOString() : null,
        is_published: isPublished,
        is_new_arrival: isNewArrival,
        is_best_seller: isBestSeller,
        is_featured: isFeatured,
        in_stock: inStock,
        images,
        variants,
      };

      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        showNotice('err', err.error || 'Could not save product');
        return;
      }

      setModalOpen(false);
      showNotice('ok', editingId ? 'Product updated and live!' : 'New product created!');
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const quickToggle = async (id: string, field: 'is_published' | 'in_stock', value: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      showNotice('ok', 'Updated immediately on live store.');
      loadData();
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'POST' });
    if (res.ok) {
      showNotice('ok', 'Product duplicated as draft.');
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showNotice('ok', 'Product deleted.');
      loadData();
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-editorial text-taupe">Inventory</p>
          <h1 className="font-serif text-3xl sm:text-4xl mt-1">Products & Stock</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-alabaster text-xs uppercase tracking-editorial hover:bg-charcoal/90"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 text-xs border ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
              : 'bg-crimson/10 border-crimson text-crimson'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or SKU..."
          className="border border-hairline bg-alabaster px-4 py-2.5 text-xs w-full max-w-sm focus:outline-none focus:border-charcoal"
        />
        <span className="text-xs text-taupe font-mono">{filtered.length} products</span>
      </div>

      {/* Product Table */}
      <div className="bg-alabaster border border-hairline overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-hairline bg-stone/40 text-taupe uppercase tracking-wider">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-taupe">
                  Loading products...
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const stock = getTotalStock(p);
                return (
                  <tr key={p.id} className="hover:bg-stone/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPrimaryImage(p)}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-stone shrink-0"
                        />
                        <div>
                          <p className="font-medium text-charcoal">{p.name}</p>
                          <p className="text-[11px] text-taupe">{p.category?.name ?? 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{p.sku}</td>
                    <td className="p-4 font-mono">
                      {formatPrice(p.current_price)}
                      {p.discount_percentage > 0 && (
                        <span className="ml-1.5 text-[10px] text-crimson">
                          -{p.discount_percentage}%
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => quickToggle(p.id, 'in_stock', !p.in_stock)}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border ${
                          p.in_stock && stock > 0
                            ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                            : 'border-crimson text-crimson bg-crimson/5'
                        }`}
                      >
                        {p.in_stock ? `In Stock (${stock})` : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => quickToggle(p.id, 'is_published', !p.is_published)}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border ${
                          p.is_published
                            ? 'bg-charcoal text-alabaster border-charcoal'
                            : 'border-hairline text-taupe'
                        }`}
                      >
                        {p.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          title="Edit"
                          className="p-1.5 border border-hairline hover:border-charcoal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(p.id)}
                          title="Duplicate"
                          className="p-1.5 border border-hairline hover:border-charcoal"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                          className="p-1.5 border border-hairline text-crimson hover:border-crimson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-alabaster border border-hairline max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-taupe hover:text-charcoal" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="KORA-TS-010"
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Fabric Details
                  </label>
                  <input
                    type="text"
                    value={fabricDetails}
                    onChange={(e) => setFabricDetails(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    GSM / Weight
                  </label>
                  <input
                    type="text"
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value)}
                    placeholder="320 GSM"
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-taupe mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-hairline px-3 py-2.5 bg-alabaster"
                />
              </div>

              {/* Pricing & Scheduled Discounts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-hairline pt-4">
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Current Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Original Price (for strikethrough)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="95"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    className="w-full border border-hairline px-3 py-2.5 bg-alabaster font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Discount Starts (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={discountStarts}
                    onChange={(e) => setDiscountStarts(e.target.value)}
                    className="w-full border border-hairline px-3 py-2 bg-alabaster"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe mb-1.5">
                    Discount Ends (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={discountEnds}
                    onChange={(e) => setDiscountEnds(e.target.value)}
                    className="w-full border border-hairline px-3 py-2 bg-alabaster"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalPrice('');
                      setDiscountPct('0');
                      setDiscountStarts('');
                      setDiscountEnds('');
                    }}
                    className="px-3 py-2 border border-hairline text-[11px] hover:border-charcoal"
                  >
                    Clear Discount
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t border-hairline pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="uppercase tracking-wider text-taupe">
                    Product Images (Upload from Computer or Mobile)
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone border border-hairline cursor-pointer hover:border-charcoal">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-24 border border-hairline bg-stone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-charcoal text-alabaster rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants: Size x Color x Stock */}
              <div className="border-t border-hairline pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="uppercase tracking-wider text-taupe">
                    Size, Color & Stock Matrix
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((prev) => [
                        ...prev,
                        { size: 'XL', color_name: 'Onyx Black', color_hex: '#141414', stock_quantity: 10 },
                      ])
                    }
                    className="px-3 py-1.5 border border-hairline hover:border-charcoal"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Size (M)"
                        value={v.size}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx].size = e.target.value;
                          setVariants(copy);
                        }}
                        className="col-span-3 border border-hairline px-2.5 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Color Name"
                        value={v.color_name}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx].color_name = e.target.value;
                          setVariants(copy);
                        }}
                        className="col-span-4 border border-hairline px-2.5 py-2"
                      />
                      <input
                        type="color"
                        value={v.color_hex}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx].color_hex = e.target.value;
                          setVariants(copy);
                        }}
                        className="col-span-1 h-9 w-full border border-hairline p-0.5"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Qty"
                        value={v.stock_quantity}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx].stock_quantity = Number(e.target.value);
                          setVariants(copy);
                        }}
                        className="col-span-3 border border-hairline px-2.5 py-2 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                        className="col-span-1 text-crimson flex justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="border-t border-hairline pt-4 flex flex-wrap gap-6">
                {[
                  { label: 'Published (Visible)', checked: isPublished, set: setIsPublished },
                  { label: 'In Stock', checked: inStock, set: setInStock },
                  { label: 'New Arrival', checked: isNewArrival, set: setIsNewArrival },
                  { label: 'Best Seller', checked: isBestSeller, set: setIsBestSeller },
                  { label: 'Featured', checked: isFeatured, set: setIsFeatured },
                ].map((flag) => (
                  <label key={flag.label} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flag.checked}
                      onChange={(e) => flag.set(e.target.checked)}
                      className="accent-charcoal"
                    />
                    {flag.label}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 border border-hairline uppercase tracking-editorial"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-charcoal text-alabaster uppercase tracking-editorial disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
