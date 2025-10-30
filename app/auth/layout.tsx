"use client";

import { ReactNode, useEffect } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Prevent scrolling on both html and body
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Clean up function to restore scrolling when component unmounts
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      <main className="min-h-screen flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
