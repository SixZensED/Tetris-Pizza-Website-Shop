"use client";

import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
