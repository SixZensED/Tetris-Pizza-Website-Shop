"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguageContext } from "../contexts/language-context";
import { getFoodCategoriesCopy, type FoodCategoryKey } from "../lib/translations";

const CATEGORY_ORDER: FoodCategoryKey[] = ["promotion", "combo", "pizza", "chicken", "drinks"];

const CATEGORY_IMAGES: Record<FoodCategoryKey, { src: string; alt: string }> = {
  promotion: { src: "/images/Food_Category/Promotion.png", alt: "Promotion" },
  pizza: { src: "/images/Food_Category/Pizza.png", alt: "Pizza" },
  combo: { src: "/images/Food_Category/Combo.png", alt: "Combo set" },
  chicken: { src: "/images/Food_Category/Chicken.png", alt: "Fried chicken" },
  drinks: { src: "/images/Food_Category/Drinks.png", alt: "Drinks" },
};

export function OrderCategoryNavbar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguageContext();
  const copy = getFoodCategoriesCopy(language);

  const initialCategory = useMemo(() => {
    const categoryParam = searchParams?.get("category");
    if (isCategoryKey(categoryParam)) {
      return categoryParam;
    }
    return "promotion";
  }, [searchParams]);

  const [activeCategory, setActiveCategory] = useState<FoodCategoryKey>(initialCategory);

  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (isCategoryKey(categoryParam) && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams, activeCategory]);

  const handleSelect = (category: FoodCategoryKey) => {
    setActiveCategory(category);

    if (pathname) {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      params.set("category", category);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    const sectionId = `order-category-${category}`;
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="mt-10">
      <div className="mx-auto w-full max-w-[1440px] px-6">
        <header className="flex items-center gap-3">
          <FoodCategoriesIcon className="h-7 w-7 text-[#b21807]" />
          <h2 className="text-lg font-semibold tracking-tight text-[#515151]">
            {copy.heading}
          </h2>
        </header>
      </div>

      <nav
        aria-label="Order categories"
        className="mt-4 bg-gradient-to-b from-[#16171a] to-[#0f1012] shadow-[0_20px_45px_rgba(15,17,19,0.45)]"
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 overflow-x-auto px-6 py-6 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-evenly">
          {CATEGORY_ORDER.map((category) => {
            const isActive = category === activeCategory;
            const label = copy.items[category];
            const image = CATEGORY_IMAGES[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleSelect(category)}
                aria-pressed={isActive}
                className={`group relative flex flex-col items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium uppercase tracking-wide transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5d0d0] md:px-6 md:py-3 md:text-sm`}
              >
                <span
                  className={`absolute inset-0 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "scale-105 bg-gradient-to-b from-[#e52f24] to-[#b21807] shadow-[0_18px_45px_rgba(229,47,36,0.4)]"
                      : "scale-95 bg-transparent opacity-0 group-hover:scale-100 group-hover:bg-[rgba(255,255,255,0.08)] group-hover:opacity-100"
                  }`}
                  aria-hidden
                />

                <span className="relative flex h-16 w-16 items-end justify-center md:h-18 md:w-18">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={72}
                    height={72}
                    className={`transition-transform duration-200 ${
                      isActive ? "scale-110" : "scale-95 group-hover:scale-105"
                    }`}
                  />
                </span>
                <span
                  className={`relative whitespace-nowrap transition-colors duration-200 ${
                    isActive ? "text-white" : "text-[#e0e0e0] group-hover:text-white"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-4 hidden h-1 w-10 rounded-full bg-gradient-to-r from-[#f3a6a1] via-[#ffd3cf] to-[#f3a6a1] md:block" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </section>
  );
}

function isCategoryKey(value: string | null): value is FoodCategoryKey {
  if (!value) return false;
  return CATEGORY_ORDER.includes(value as FoodCategoryKey);
}

function FoodCategoriesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        d="M4.505 2h-.013a.5.5 0 0 0-.176.036a.5.5 0 0 0-.31.388C3.99 2.518 3.5 5.595 3.5 7c0 .95.442 1.797 1.13 2.345c.25.201.37.419.37.601v.5q0 .027-.003.054c-.027.26-.151 1.429-.268 2.631C4.614 14.316 4.5 15.581 4.5 16a2 2 0 1 0 4 0c0-.42-.114-1.684-.229-2.869a302 302 0 0 0-.268-2.63L8 10.446v-.5c0-.183.12-.4.37-.601A3 3 0 0 0 9.5 7c0-1.408-.493-4.499-.506-4.577a.5.5 0 0 0-.355-.403A.5.5 0 0 0 8.51 2h-.02h.001a.505.505 0 0 0-.501.505v4a.495.495 0 0 1-.99.021V2.5a.5.5 0 0 0-1 0v4l.001.032a.495.495 0 0 1-.99-.027V2.506A.506.506 0 0 0 4.506 2M11 6.5A4.5 4.5 0 0 1 15.5 2a.5.5 0 0 1 .5.5v6.978l.02.224a626 626 0 0 1 .228 2.696c.124 1.507.252 3.161.252 3.602a2 2 0 1 1-4 0c0-.44.128-2.095.252-3.602c.062-.761.125-1.497.172-2.042l.03-.356H12.5A1.5 1.5 0 0 1 11 8.5zM8.495 2h-.004z"
        fill="currentColor"
      />
    </svg>
  );
}
