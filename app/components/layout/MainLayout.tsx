"use client";

import { TopBar } from "./topbar";
import { Footer } from "./footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
}
