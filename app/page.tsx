"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OrderTypeSection } from "./components/sections/order-type-section";
import { BannerCarousel } from "./components/sections/banner-carousel";
import { FoodCategoriesSection } from "./components/sections/food-categories-section";
import { PromotionCategoriesSection } from "./components/sections/promotion-categories-section";

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const category = searchParams.get("category");
    setSelectedCategory(category);
  }, [searchParams]);

  return (
    <main className="flex-1 w-full pt-4 pb-16">
      <OrderTypeSection />
      <BannerCarousel />
      <FoodCategoriesSection />
      <PromotionCategoriesSection />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b21807]"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
