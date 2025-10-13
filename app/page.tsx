import { TopBar } from "./components/topbar";
import { OrderTypeSection } from "./components/order-type-section";
import { BannerCarousel } from "./components/banner-carousel";
import { FoodCategoriesSection } from "./components/food-categories-section";
import { PromotionCategoriesSection } from "./components/promotion-categories-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <main className="w-full px-6 pt-4 pb-16">
        <OrderTypeSection />
        <BannerCarousel />
        <FoodCategoriesSection />
        <PromotionCategoriesSection />
      </main>
    </div>
  );
}
