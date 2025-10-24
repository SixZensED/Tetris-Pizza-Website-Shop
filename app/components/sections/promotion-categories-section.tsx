"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguageContext } from "../../contexts/language-context";
import {
  DEFAULT_LANGUAGE,
  getPromotionCategoriesCopy,
  isSupportedLanguage,
  type LanguageCode,
} from "../../lib/translations";

const SECTION_MAX_WIDTH = "max-w-[1440px]";
const CARD_ASPECT_RATIO = "320 / 180";

// Consistent Promotion interface
interface Promotion {
  promotion_id: string;
  name: string;
  description?: string;
  image_url?: string | null;
  is_active: boolean;
  coupon_code: string;
  discount_type: "Percentage" | "Fixed Amount";
  discount_value: number;
  min_purchase: number;
  start_date: string;
  expiry_date: string;
}

export function PromotionCategoriesSection() {
  const { language } = useLanguageContext();
  const languageCode: LanguageCode = isSupportedLanguage(language)
    ? language
    : DEFAULT_LANGUAGE;
  const copy = getPromotionCategoriesCopy(languageCode);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${apiBaseUrl}/api/promotions`);
        if (!response.ok) {
          throw new Error("Failed to fetch promotions");
        }

        const payload = await response.json();
        const items = payload.promotions || payload.data || payload;

        if (Array.isArray(items)) {
          const promotionsWithImages = items
            .filter((p: Promotion) => p.is_active && p.image_url)
            .sort(
              (a, b) =>
                new Date(b.start_date).getTime() -
                new Date(a.start_date).getTime(),
            );
          setPromotions(promotionsWithImages);
        }
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  if (promotions.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className={`mx-auto w-full ${SECTION_MAX_WIDTH} px-6`}>
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/Food_Category/Promotion.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <h2 className="text-lg font-bold tracking-tight text-[#515151]">
              {copy.heading}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#b21807] px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(178,24,7,0.25)] transition hover:bg-[#921506] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b21807]"
          >
            {copy.viewAllLabel}
          </button>
        </header>

        <div className="-mx-1 mt-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-4 px-1 md:w-full md:grid md:grid-cols-3 md:gap-6">
            {promotions.map((promotion) => (
              <PromotionCard
                key={promotion.promotion_id}
                promotion={promotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type PromotionCardProps = {
  promotion: Promotion;
};

function PromotionCard({ promotion }: PromotionCardProps) {
  const { description, image_url, name } = promotion;

  return (
    <article className="flex w-[240px] flex-col overflow-hidden rounded-[24px] bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl md:w-full">
      <div
        className="relative w-full"
        style={{ aspectRatio: CARD_ASPECT_RATIO }}
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={name || 'Promotion image'}
            fill
            sizes="(max-width: 768px) 240px, (max-width: 1280px) 30vw, 320px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <p className="px-4 pb-4 pt-3 text-center text-sm font-semibold text-[#b21807] md:text-base">
        {description || name}
      </p>
    </article>
  );
}
