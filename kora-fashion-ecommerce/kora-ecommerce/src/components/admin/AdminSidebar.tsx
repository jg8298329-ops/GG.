'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/types/database';

const NAV_ITEMS = [
  { href: '/store-control', label: 'Overview', icon: LayoutDashboard },
  { href: '/store-control/products', label: 'Products & Stock', icon: Package },
  { href: '/store-control/categories', label: 'Categories', icon: FolderTree },
  { href: '/store-control/banners', label: 'Homepage & Banners', icon: ImageIcon },
  { href: '/store-control/orders', label: 'WhatsApp Orders', icon: MessageSquare },
  { href: '/store-control/settings', label: 'Website Settings', icon: Settings },
  { href: '/store-control/admins', label: 'Admin Users', icon: ShieldCheck },
];

export function AdminSidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/store-control/login');
    router.refresh();
  };

  return (
    <aside className="w-full lg:w-64 bg-charcoal text-alabaster flex flex-col justify-between shrink-0 lg:min-h-screen">
      <div>
        <div className="p-6 border-b border-alabaster/10">
          <p className="text-[10px] uppercase tracking-editorial text-alabaster/50">
            Private Console
          </p>
          <h2 className="font-serif text-2xl mt-1">Store Control</h2>
          <p className="text-xs text-alabaster/70 mt-2 truncate">{admin.full_name}</p>
          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-alabaster/10 px-2 py-0.5 text-alabaster/80">
            {admin.role.replace('_', ' ')}
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.href === '/store-control/admins' && admin.role !== 'super_admin') {
              return null;
            }
            const Icon = item.icon;
            const isActive =
              item.href === '/store-control'
                ? pathname === '/store-control'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs tracking-wide transition-colors ${
                  isActive
                    ? 'bg-alabaster text-charcoal font-medium'
                    : 'text-alabaster/75 hover:bg-alabaster/10 hover:text-alabaster'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-alabaster/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 text-xs text-alabaster/75 hover:bg-alabaster/10 hover:text-alabaster transition-colors"
        >
          <span>View Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
