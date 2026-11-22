'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Announcement } from '@/types/database';

export function AnnouncementBar({ announcements }: { announcements: Announcement[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) return null;
  const current = announcements[index];

  return (
    <div className="bg-charcoal text-alabaster text-[11px] tracking-editorial uppercase py-2 px-4 text-center">
      {current.link_url ? (
        <Link href={current.link_url} className="hover:underline underline-offset-4">
          {current.message}
        </Link>
      ) : (
        <span>{current.message}</span>
      )}
    </div>
  );
}
