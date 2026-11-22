# KORA — Premium Fashion E-Commerce Platform

A full-stack, production-ready fashion e-commerce storefront and private admin dashboard built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (PostgreSQL + Auth + Storage + RLS), and **Netlify**.

## 1. Architecture Overview

- **Customer Storefront (`/`, `/shop`, `/products/[slug]`, `/checkout`)**:
  - Editorial neutral design (`#FAF9F6` alabaster, `#141414` charcoal, Cormorant Garamond + Plus Jakarta Sans + JetBrains Mono).
  - Live database-driven categories, products, multi-image galleries, size/color variant stock, scheduled discounts, hero banners, and announcement bar.
  - Persistent Shopping Bag drawer and **WhatsApp Checkout** with configurable Inside Dhaka / Outside Dhaka delivery charges.
- **Private Admin Dashboard (`/store-control`)**:
  - Discreet URL not linked anywhere on customer pages, protected by `X-Robots-Tag: noindex, nofollow`, Next.js Edge Middleware, and server-side `verifyAdminSession()` checks.
  - Visual management for Products, Stock Variants, Categories, Hero/Promo Banners, Announcements, WhatsApp Orders, Website Settings, and Admin Users.
  - Immediate storefront updates via `noStore` + `revalidatePath('/', 'layout')` — **no Netlify redeployment required** for product, price, or banner changes.

---

## 2. Supabase Configuration & Database Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard and run:
   - `supabase/migrations/001_initial_schema.sql` (creates all 10 tables, triggers, RLS policies, and the `store-media` storage bucket).
   - `supabase/seed.sql` (populates initial categories, sample products, banners, announcements, and site settings).
3. **Create Your First Super Admin**:
   - In Supabase Dashboard → **Authentication → Users**, click **Add user → Create new user** with your admin email and strong password (check **Auto Confirm User**).
   - Copy the created user's `UUID`, then run this SQL in the SQL Editor:
     ```sql
     INSERT INTO public.admin_users (id, email, full_name, role, is_active)
     VALUES ('YOUR-USER-UUID-HERE', 'admin@yourdomain.com', 'Store Owner', 'super_admin', true);
     ```
4. **Configure Password Reset Redirects**:
   - In Supabase Dashboard → **Authentication → URL Configuration**, add your production URL (`https://yourdomain.com/store-control/reset-password`) to **Redirect URLs**.

---

## 3. Local Development Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` from **Supabase → Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only — never prefix with `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/store-control/login` for the private admin console.

---

## 4. Netlify Deployment Guide

1. Push this repository to **GitHub** (ensure `.env.local` is not committed — `.gitignore` already excludes it).
2. Log in to [Netlify](https://app.netlify.com) and click **Add new site → Import an existing project → GitHub**.
3. Build settings (auto-detected from `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Plugin**: `@netlify/plugin-nextjs`
4. Add **Environment Variables** in **Site configuration → Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your live `https://...` URL)
5. Click **Deploy site**.
6. **Custom Domain**: Go to **Domain management → Add a domain**, follow the DNS instructions, and enable **HTTPS (Let's Encrypt)**.
