"use client";

import { ThemeProvider } from "@material-tailwind/react";
import { LanguageProvider } from "./contexts/language-context";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
