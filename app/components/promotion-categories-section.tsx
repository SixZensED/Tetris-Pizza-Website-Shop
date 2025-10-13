"use client";

import Image from "next/image";
import { PROMOTIONS, type Promotion, getPromotionTitle } from "../data/promotions";
import { useLanguageContext } from "../contexts/language-context";
import { DEFAULT_LANGUAGE, getPromotionCategoriesCopy, isSupportedLanguage, type LanguageCode } from "../lib/translations";

const SECTION_MAX_WIDTH = "max-w-[1440px]";
const CARD_ASPECT_RATIO = "320 / 180";

export function PromotionCategoriesSection() {
  const { language } = useLanguageContext();
  const languageCode: LanguageCode = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
  const copy = getPromotionCategoriesCopy(languageCode);

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
            <h2 className="text-lg font-bold tracking-tight text-[#515151]">{copy.heading}</h2>
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
            {PROMOTIONS.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} language={languageCode} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type PromotionCardProps = {
  promotion: Promotion;
  language: LanguageCode;
};

function PromotionCard({ promotion, language }: PromotionCardProps) {
  const title = getPromotionTitle(language, promotion);
  const { image, alt } = promotion;

  return (
    <article className="flex w-[240px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(0,0,0,0.16)] md:w-full">
      <div className="relative w-full" style={{ aspectRatio: CARD_ASPECT_RATIO }}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 240px, (max-width: 1280px) 30vw, 320px"
          className="h-full w-full object-cover"
        />
      </div>
      <p className="px-4 pb-4 pt-3 text-center text-sm font-semibold text-[#b21807] md:text-base">
        {title}
      </p>
    </article>
  );
}
