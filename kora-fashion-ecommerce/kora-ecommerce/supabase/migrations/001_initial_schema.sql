-- ============================================================================
-- KORA FASHION E-COMMERCE — COMPLETE SUPABASE SCHEMA & RLS POLICIES
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. UTILITY TRIGGER FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ADMIN USERS & ROLE-BASED ACCESS CONTROL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Store Administrator',
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('super_admin', 'manager', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Helper functions for RLS (SECURITY DEFINER prevents recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 3. CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_order ON public.categories(display_order);

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. PRODUCTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  fabric_details TEXT NOT NULL DEFAULT '',
  gsm TEXT NOT NULL DEFAULT '',
  current_price NUMERIC(10, 2) NOT NULL CHECK (current_price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= 0),
  discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 95),
  discount_starts_at TIMESTAMPTZ,
  discount_ends_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  size_guide JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_published ON public.products(is_published);
CREATE INDEX idx_products_flags ON public.products(is_new_arrival, is_best_seller, is_featured);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. PRODUCT IMAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id, display_order);

-- ============================================================================
-- 6. PRODUCT VARIANTS (SIZE x COLOR x STOCK)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#141414',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sku_suffix TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, size, color_name)
);

CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. HOMEPAGE BANNERS & ANNOUNCEMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.homepage_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT DEFAULT 'Shop Collection',
  cta_link TEXT DEFAULT '/shop',
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  placement TEXT NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero', 'promo_strip', 'collection_banner')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_homepage_banners_updated_at
  BEFORE UPDATE ON public.homepage_banners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 8. WEBSITE SETTINGS (SINGLETON ROW id = 1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'KORA',
  brand_tagline TEXT NOT NULL DEFAULT 'Minimal. Tailored. Timeless.',
  logo_url TEXT,
  contact_email TEXT NOT NULL DEFAULT 'concierge@korastudio.com',
  contact_phone TEXT NOT NULL DEFAULT '+880 1700-000000',
  whatsapp_number TEXT NOT NULL DEFAULT '8801700000000',
  address TEXT NOT NULL DEFAULT 'Banani, Road 11, Dhaka 1213, Bangladesh',
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  currency_symbol TEXT NOT NULL DEFAULT '৳',
  delivery_charge_inside_dhaka NUMERIC(10, 2) NOT NULL DEFAULT 70,
  delivery_charge_outside_dhaka NUMERIC(10, 2) NOT NULL DEFAULT 130,
  delivery_info TEXT NOT NULL DEFAULT 'Inside Dhaka: 24–48 hours. Outside Dhaka: 2–4 business days via Steadfast / Pathao Courier.',
  return_policy TEXT NOT NULL DEFAULT '7-day size exchange on unworn garments with original tags attached.',
  privacy_policy TEXT NOT NULL DEFAULT 'Customer delivery details are used solely to fulfill WhatsApp orders.',
  terms_policy TEXT NOT NULL DEFAULT 'Orders placed via WhatsApp are confirmed only after our team verifies stock and delivery details.',
  brand_story_title TEXT NOT NULL DEFAULT 'Crafted in Dhaka. Built to Endure.',
  brand_story_body TEXT NOT NULL DEFAULT 'Every KORA garment begins with combed organic cotton and heavyweight fleece milled locally to exacting GSM standards—designed for effortless silhouettes and everyday longevity.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 9. WHATSAPP ORDERS & NEWSLETTER SUBSCRIBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_region TEXT NOT NULL CHECK (delivery_region IN ('inside_dhaka', 'outside_dhaka')),
  district TEXT NOT NULL,
  thana_area TEXT NOT NULL,
  full_address TEXT NOT NULL,
  order_notes TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_charge NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_whatsapp' CHECK (status IN ('pending_whatsapp', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_whatsapp_orders_updated_at
  BEFORE UPDATE ON public.whatsapp_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. ADMIN ACTIVITY LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_created ON public.admin_activity_logs(created_at DESC);

-- ============================================================================
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin Users
CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Super admins can manage admin_users" ON public.admin_users
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Categories
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products
CREATE POLICY "Public can view published products" ON public.products
  FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Product Images
CREATE POLICY "Public can view images of published products" ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.is_published = true OR public.is_admin()))
  );
CREATE POLICY "Admins can manage product_images" ON public.product_images
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Product Variants
CREATE POLICY "Public can view variants of published products" ON public.product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.is_published = true OR public.is_admin()))
  );
CREATE POLICY "Admins can manage product_variants" ON public.product_variants
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Homepage Banners
CREATE POLICY "Public can view active banners" ON public.homepage_banners
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage banners" ON public.homepage_banners
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Announcements
CREATE POLICY "Public can view active announcements" ON public.announcements
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Site Settings
CREATE POLICY "Public can view site_settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update site_settings" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- WhatsApp Orders (Public can create, only admins can read/update/delete)
CREATE POLICY "Public can submit whatsapp_orders" ON public.whatsapp_orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage whatsapp_orders" ON public.whatsapp_orders
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update whatsapp_orders" ON public.whatsapp_orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete whatsapp_orders" ON public.whatsapp_orders
  FOR DELETE USING (public.is_admin());

-- Newsletter Subscribers
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- Activity Logs
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================================
-- 12. SUPABASE STORAGE BUCKET & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-media', 'store-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view store media" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-media');

CREATE POLICY "Admins can upload store media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-media' AND public.is_admin());

CREATE POLICY "Admins can update store media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'store-media' AND public.is_admin());

CREATE POLICY "Admins can delete store media" ON storage.objects
  FOR DELETE USING (bucket_id = 'store-media' AND public.is_admin());
