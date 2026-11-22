import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type {
  Announcement,
  Category,
  HomepageBanner,
  Product,
  SiteSettings,
} from '@/types/database';

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  brand_name: 'KORA',
  brand_tagline: 'Minimal. Tailored. Timeless.',
  logo_url: null,
  contact_email: 'concierge@korastudio.com',
  contact_phone: '+880 1700-000000',
  whatsapp_number: '8801700000000',
  address: 'Road 11, Banani, Dhaka 1213, Bangladesh',
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
  currency_symbol: '৳',
  delivery_charge_inside_dhaka: 70,
  delivery_charge_outside_dhaka: 130,
  delivery_info: 'Inside Dhaka: 24–48 hours. Outside Dhaka: 2–4 business days.',
  return_policy: '7-day size exchange on unworn garments with original tags.',
  privacy_policy: 'Customer delivery details are used solely to fulfill WhatsApp orders.',
  terms_policy: 'Orders placed via WhatsApp are confirmed only after our team verifies stock.',
  brand_story_title: 'Crafted in Dhaka. Built to Endure.',
  brand_story_body:
    'Every KORA garment begins with combed organic cotton and heavyweight French terry milled to exacting GSM standards.',
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  noStore();
  try {
    const supabase = createClient();
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    return (data as SiteSettings) ?? FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  noStore();
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return (data as Announcement[]) ?? [];
  } catch {
    return [];
  }
}

export async function getActiveBanners(): Promise<HomepageBanner[]> {
  noStore();
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('homepage_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return (data as HomepageBanner[]) ?? [];
  } catch {
    return [];
  }
}

export async function getActiveCategories(): Promise<Category[]> {
  noStore();
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return (data as Category[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPublishedProducts(): Promise<Product[]> {
  noStore();
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        product_images(*),
        product_variants(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    const products = (data as Product[]) ?? [];
    return products.map((p) => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a, b) => a.display_order - b.display_order),
    }));
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        product_images(*),
        product_variants(*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!data) return null;
    const product = data as Product;
    product.product_images = (product.product_images ?? []).sort(
      (a, b) => a.display_order - b.display_order
    );
    return product;
  } catch {
    return null;
  }
}
