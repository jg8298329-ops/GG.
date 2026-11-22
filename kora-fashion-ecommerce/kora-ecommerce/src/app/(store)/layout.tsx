import {
  getActiveAnnouncements,
  getActiveCategories,
  getSiteSettings,
} from '@/lib/queries';
import { AnnouncementBar } from '@/components/store/AnnouncementBar';
import { Navbar } from '@/components/store/Navbar';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Footer } from '@/components/store/Footer';

export const dynamic = 'force-dynamic';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, announcements, categories] = await Promise.all([
    getSiteSettings(),
    getActiveAnnouncements(),
    getActiveCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar announcements={announcements} />
      <Navbar settings={settings} categories={categories} />
      <CartDrawer currencySymbol={settings.currency_symbol} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} categories={categories} />
    </div>
  );
}
