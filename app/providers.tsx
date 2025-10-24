"use client";

import { ThemeProvider } from "@material-tailwind/react";
import { LanguageProvider } from "./contexts/language-context";
import { CartProvider } from "./contexts/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>{children}</CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
