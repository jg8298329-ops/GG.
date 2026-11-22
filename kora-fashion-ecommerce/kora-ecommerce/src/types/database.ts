export type AdminRole = 'super_admin' | 'manager' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SizeGuideRow {
  size: string;
  chest?: string;
  waist?: string;
  length?: string;
  shoulder?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color_name: string;
  color_hex: string;
  stock_quantity: number;
  sku_suffix: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string | null;
  description: string;
  fabric_details: string;
  gsm: string;
  current_price: number;
  original_price: number | null;
  discount_percentage: number;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  is_published: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  in_stock: boolean;
  size_guide: SizeGuideRow[];
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string;
  mobile_image_url: string | null;
  placement: 'hero' | 'promo_strip' | 'collection_banner';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  message: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  brand_name: string;
  brand_tagline: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  currency_symbol: string;
  delivery_charge_inside_dhaka: number;
  delivery_charge_outside_dhaka: number;
  delivery_info: string;
  return_policy: string;
  privacy_policy: string;
  terms_policy: string;
  brand_story_title: string;
  brand_story_body: string;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  imageUrl: string;
  price: number;
  originalPrice: number | null;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  maxStock: number;
}

export interface WhatsAppOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_region: 'inside_dhaka' | 'outside_dhaka';
  district: string;
  thana_area: string;
  full_address: string;
  order_notes: string | null;
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  status: 'pending_whatsapp' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string | null;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
