import { notFound } from 'next/navigation';
import { getProductBySlug, getSiteSettings } from '@/lib/queries';
import { ProductDetailClient } from '@/components/store/ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.slug),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} settings={settings} />;
}
