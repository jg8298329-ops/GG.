-- ============================================================================
-- KORA FASHION E-COMMERCE — INITIAL SEED DATA
-- ============================================================================

-- 1. Site Settings (Singleton)
INSERT INTO public.site_settings (
  id, brand_name, brand_tagline, contact_email, contact_phone, whatsapp_number,
  address, instagram_url, facebook_url, currency_symbol,
  delivery_charge_inside_dhaka, delivery_charge_outside_dhaka,
  brand_story_title, brand_story_body
) VALUES (
  1,
  'KORA',
  'Minimal. Tailored. Timeless.',
  'concierge@korastudio.com',
  '+880 1700-000000',
  '8801700000000',
  'Road 11, Banani, Dhaka 1213, Bangladesh',
  'https://instagram.com/korastudio.bd',
  'https://facebook.com/korastudio.bd',
  '৳',
  70,
  130,
  'Crafted in Dhaka. Built to Endure.',
  'Every KORA garment begins with combed organic cotton and heavyweight French terry milled to exacting GSM standards—designed for effortless silhouettes, disciplined drape, and everyday longevity.'
) ON CONFLICT (id) DO NOTHING;

-- 2. Announcements
INSERT INTO public.announcements (message, link_url, display_order, is_active) VALUES
  ('WINTER CAPSULE 2026 — HEAVYWEIGHT 400 GSM FLEECE NOW LIVE', '/shop', 1, true),
  ('FREE SIZE EXCHANGE WITHIN 7 DAYS · CASH ON DELIVERY ACROSS BANGLADESH', '/shop', 2, true);

-- 3. Homepage Banners
INSERT INTO public.homepage_banners (title, subtitle, cta_text, cta_link, image_url, placement, display_order, is_active) VALUES
  (
    'The Monochrome Architecture',
    'Heavyweight 260–400 GSM essentials tailored for the modern silhouette.',
    'Explore Collection',
    '/shop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80',
    'hero',
    1,
    true
  ),
  (
    'Boxy & Drop-Shoulder Edit',
    'Acid-washed organic cotton and structured French terry.',
    'Shop New Arrivals',
    '/shop?filter=new',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1800&q=80',
    'hero',
    2,
    true
  );

-- 4. Categories
INSERT INTO public.categories (name, slug, description, image_url, display_order, is_active) VALUES
  ('T-Shirts', 't-shirts', 'Drop-shoulder and boxy heavyweight tees.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 1, true),
  ('Hoodies', 'hoodies', '400 GSM brushed fleece and structured hoods.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', 2, true),
  ('Sweatshirts', 'sweatshirts', 'Boxy crewnecks and rugby sweatshirts.', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80', 3, true),
  ('Shirts', 'shirts', 'Relaxed linen-cotton and old-money knit polos.', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80', 4, true),
  ('Pants', 'pants', 'Wide-leg tailored trousers and heavyweight sweatpants.', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Sample Products + Images + Variants
DO $$
DECLARE
  cat_tee UUID;
  cat_hoodie UUID;
  cat_sweat UUID;
  cat_shirt UUID;
  cat_pant UUID;
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID; p6 UUID;
BEGIN
  SELECT id INTO cat_tee FROM public.categories WHERE slug = 't-shirts';
  SELECT id INTO cat_hoodie FROM public.categories WHERE slug = 'hoodies';
  SELECT id INTO cat_sweat FROM public.categories WHERE slug = 'sweatshirts';
  SELECT id INTO cat_shirt FROM public.categories WHERE slug = 'shirts';
  SELECT id INTO cat_pant FROM public.categories WHERE slug = 'pants';

  -- Product 1
  INSERT INTO public.products (name, slug, sku, category_id, description, fabric_details, gsm, current_price, original_price, discount_percentage, is_published, is_new_arrival, is_best_seller, is_featured, in_stock, size_guide)
  VALUES (
    'Atelier Drop-Shoulder Tee — Onyx',
    'atelier-drop-shoulder-tee-onyx',
    'KORA-TS-001',
    cat_tee,
    'Cut in a relaxed drop-shoulder block with a dense ribbed collar that holds its shape wash after wash.',
    '100% Combed Ring-Spun Organic Cotton, Enzyme Washed',
    '260 GSM',
    690, 890, 22, true, true, true, true, true,
    '[{"size":"M","chest":"42 in","length":"28 in"},{"size":"L","chest":"44 in","length":"29 in"},{"size":"XL","chest":"46 in","length":"30 in"}]'::jsonb
  ) RETURNING id INTO p1;

  INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
    (p1, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', 'Atelier Drop-Shoulder Tee Onyx Front', 1, true),
    (p1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80', 'Atelier Drop-Shoulder Tee Detail', 2, false);

  INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
    (p1, 'M', 'Onyx Black', '#141414', 18),
    (p1, 'L', 'Onyx Black', '#141414', 24),
    (p1, 'XL', 'Onyx Black', '#141414', 12),
    (p1, 'M', 'Bone White', '#EFECE6', 10),
    (p1, 'L', 'Bone White', '#EFECE6', 14);

  -- Product 2
  INSERT INTO public.products (name, slug, sku, category_id, description, fabric_details, gsm, current_price, original_price, discount_percentage, is_published, is_new_arrival, is_best_seller, is_featured, in_stock, size_guide)
  VALUES (
    'Monolith Boxy Hoodie — Slate',
    'monolith-boxy-hoodie-slate',
    'KORA-HD-002',
    cat_hoodie,
    'Double-lined hood with zero-drawstring minimalist neckline, dropped shoulders, and structured cuffs.',
    '85% Cotton, 15% Recycled Poly Brushed Fleece',
    '420 GSM',
    1650, 1990, 17, true, true, true, true, true,
    '[{"size":"M","chest":"46 in","length":"27 in"},{"size":"L","chest":"48 in","length":"28 in"},{"size":"XL","chest":"50 in","length":"29 in"}]'::jsonb
  ) RETURNING id INTO p2;

  INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
    (p2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80', 'Monolith Boxy Hoodie Slate', 1, true),
    (p2, 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=1000&q=80', 'Monolith Boxy Hoodie Back', 2, false);

  INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
    (p2, 'M', 'Slate Charcoal', '#3A3B3C', 15),
    (p2, 'L', 'Slate Charcoal', '#3A3B3C', 20),
    (p2, 'XL', 'Slate Charcoal', '#3A3B3C', 8);

  -- Product 3
  INSERT INTO public.products (name, slug, sku, category_id, description, fabric_details, gsm, current_price, original_price, discount_percentage, is_published, is_new_arrival, is_best_seller, is_featured, in_stock, size_guide)
  VALUES (
    'Boxy Rugby Sweatshirt — Cream',
    'boxy-rugby-sweatshirt-cream',
    'KORA-SW-003',
    cat_sweat,
    'Clean hidden placket collar with heavyweight French terry body for effortless layering.',
    '100% Loopback French Terry Cotton',
    '360 GSM',
    1150, 1390, 17, true, true, false, true, true,
    '[{"size":"M","chest":"45 in","length":"27.5 in"},{"size":"L","chest":"47 in","length":"28.5 in"},{"size":"XL","chest":"49 in","length":"29.5 in"}]'::jsonb
  ) RETURNING id INTO p3;

  INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
    (p3, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80', 'Boxy Rugby Sweatshirt Cream', 1, true);

  INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
    (p3, 'M', 'Warm Cream', '#EAE3D5', 12),
    (p3, 'L', 'Warm Cream', '#EAE3D5', 16),
    (p3, 'XL', 'Warm Cream', '#EAE3D5', 6);

  -- Product 4
  INSERT INTO public.products (name, slug, sku, category_id, description, fabric_details, gsm, current_price, original_price, discount_percentage, is_published, is_new_arrival, is_best_seller, is_featured, in_stock, size_guide)
  VALUES (
    'Heritage Knit Polo — Espresso',
    'heritage-knit-polo-espresso',
    'KORA-SH-004',
    cat_shirt,
    'Open-collar full-sleeve knit polo inspired by quiet luxury tailoring.',
    '100% Mercerized Fine Pique Cotton',
    '240 GSM',
    1290, NULL, 0, true, false, true, true, true,
    '[{"size":"M","chest":"41 in","length":"27.5 in"},{"size":"L","chest":"43 in","length":"28.5 in"},{"size":"XL","chest":"45 in","length":"29.5 in"}]'::jsonb
  ) RETURNING id INTO p4;

  INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
    (p4, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80', 'Heritage Knit Polo Espresso', 1, true);

  INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
    (p4, 'M', 'Espresso', '#3B2F2F', 10),
    (p4, 'L', 'Espresso', '#3B2F2F', 14),
    (p4, 'XL', 'Espresso', '#3B2F2F', 9);

  -- Product 5
  INSERT INTO public.products (name, slug, sku, category_id, description, fabric_details, gsm, current_price, original_price, discount_percentage, is_published, is_new_arrival, is_best_seller, is_featured, in_stock, size_guide)
  VALUES (
    'Pleated Wide-Leg Trouser — Stone',
    'pleated-wide-leg-trouser-stone',
    'KORA-PT-005',
    cat_pant,
    'Double-pleated tailored wide-leg silhouette with concealed elastic back waist for all-day comfort.',
    'Cotton Twill Blend with Soft Brushed Finish',
    '310 GSM',
    1490, 1750, 15, true, true, true, true, true,
    '[{"size":"30","waist":"30 in","length":"40 in"},{"size":"32","waist":"32 in","length":"41 in"},{"size":"34","waist":"34 in","length":"42 in"}]'::jsonb
  ) RETURNING id INTO p5;

  INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
    (p5, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80', 'Pleated Wide-Leg Trouser Stone', 1, true);

  INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
    (p5, '30', 'Warm Stone', '#C8C0B4', 12),
    (p5, '32', 'Warm Stone', '#C8C0B4', 18),
    (p5, '34', 'Warm Stone', '#C8C0B4', 10);

  -- Product 6
  INSERT INTO public.products (name, slug, sku, category_id, description, fabric_details, gsm, current_price, original_price, discount_percentage, is_published, is_new_arrival, is_best_seller, is_featured, in_stock, size_guide)
  VALUES (
    'Acid Wash Boxy Tee — Charcoal',
    'acid-wash-boxy-tee-charcoal',
    'KORA-TS-006',
    cat_tee,
    'Vintage mineral acid wash with dropped shoulders and heavyweight drape.',
    '100% Heavyweight Combed Cotton',
    '280 GSM',
    750, 950, 21, true, false, true, false, true,
    '[{"size":"M","chest":"43 in","length":"28 in"},{"size":"L","chest":"45 in","length":"29 in"},{"size":"XL","chest":"47 in","length":"30 in"}]'::jsonb
  ) RETURNING id INTO p6;

  INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
    (p6, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', 'Acid Wash Boxy Tee Charcoal', 1, true);

  INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
    (p6, 'M', 'Washed Charcoal', '#4A4A48', 14),
    (p6, 'L', 'Washed Charcoal', '#4A4A48', 20),
    (p6, 'XL', 'Washed Charcoal', '#4A4A48', 11);
END $$;
