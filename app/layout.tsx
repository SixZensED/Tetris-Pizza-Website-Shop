"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import ConditionalLayout from "./components/layout/ConditionalLayout";
import { CartSidebar } from "./components/cart/CartSidebar";
import { OrderHistorySidebar } from "./components/orders/OrderHistorySidebar";
import GlobalPurchaseConfirmModal from "./components/modals/confirm/GlobalPurchaseConfirmModal";
import GlobalPurchaseSuccessModal from "./components/modals/success/GlobalPurchaseSuccessModal";
import GlobalRemoveConfirmModal from "./components/modals/confirm/GlobalRemoveConfirmModal";
import GlobalRemoveSuccessModal from "./components/modals/success/GlobalRemoveSuccessModal";

const lineSeedSans = localFont({
  src: [
    { path: "../public/fonts/LINESeedSansTH_W_Th.woff2", weight: "200", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_Th.woff", weight: "200", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_Rg.woff2", weight: "400", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_Rg.woff", weight: "400", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_Bd.woff2", weight: "700", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_Bd.woff", weight: "700", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_He.woff2", weight: "800", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_He.woff", weight: "800", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_XBd.woff2", weight: "900", style: "normal",},
    { path: "../public/fonts/LINESeedSansTH_W_XBd.woff", weight: "900", style: "normal",},
  ],
  variable: "--font-line-seed",display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lineSeedSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <CartSidebar />
          <OrderHistorySidebar />
          <GlobalPurchaseConfirmModal />
          <GlobalRemoveConfirmModal />
          <GlobalPurchaseSuccessModal />
          <GlobalRemoveSuccessModal />
        </Providers>
      </body>
    </html>
  );
}