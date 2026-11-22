import { Suspense } from 'react';
import { getActiveCategories, getPublishedProducts, getSiteSettings } from '@/lib/queries';
import { ShopCatalog } from '@/components/store/ShopCatalog';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, categories, settings] = await Promise.all([
    getPublishedProducts(),
    getActiveCategories(),
    getSiteSettings(),
  ]);

  return (
    <Suspense fallback={<div className="py-24 text-center text-xs uppercase tracking-editorial">Loading Collection...</div>}>
      <ShopCatalog
        products={products}
        categories={categories}
        currencySymbol={settings.currency_symbol}
      />
    </Suspense>
  );
}
