import type { LanguageCode } from "../lib/translations";

export type Promotion = {
  id: string;
  image: string;
  alt: string;
  titles: Partial<Record<LanguageCode, string>> & { fallback: string };
};

export const PROMOTIONS: Promotion[] = [
  {
    id: "buy-one-get-one-l",
    image: "/images/promotions/promo-1.png",
    alt: "Buy 1 Get 1 large pizza promotion banner",
    titles: {
      EN: "Buy 1 Get 1 (Large Pizza)",
      TH: "1 แถม 1 (พิซซ่าไซส์ L)",
      fallback: "Buy 1 Get 1 (Large Pizza)",
    },
  },
  {
    id: "shrimp-crust-double",
    image: "/images/promotions/promo-1.png",
    alt: "Shrimp crust double combo promotion banner",
    titles: {
      EN: "Shrimp Crust Double Combo",
      TH: "กุ้งเน้นๆ ครัสต์คู่คอมโบ",
      fallback: "Shrimp Crust Double Combo",
    },
  },
  {
    id: "family-feast",
    image: "/images/promotions/promo-1.png",
    alt: "Family feast promotion banner",
    titles: {
      EN: "Family Feast Special",
      TH: "ชุดครอบครัวสุดคุ้ม",
      fallback: "Family Feast Special",
    },
  },
  {
    id: "lunch-set",
    image: "/images/promotions/promo-1.png",
    alt: "Lunch set promotion banner",
    titles: {
      EN: "Weekday Lunch Set",
      TH: "ชุดมื้อกลางวันวันธรรมดา",
      fallback: "Weekday Lunch Set",
    },
  },
  {
    id: "party-pack",
    image: "/images/promotions/promo-1.png",
    alt: "Party pack promotion banner",
    titles: {
      EN: "Party Pack 4-6 Pax",
      TH: "ปาร์ตี้แพ็ก 4-6 คน",
      fallback: "Party Pack 4-6 Pax",
    },
  },
  {
    id: "late-night",
    image: "/images/promotions/promo-1.png",
    alt: "Late night promotion banner",
    titles: {
      EN: "Late Night Pizza Treat",
      TH: "พิซซ่าดึกดื่นสุดคุ้ม",
      fallback: "Late Night Pizza Treat",
    },
  },
];

export function getPromotionTitle(language: LanguageCode, promotion: Promotion): string {
  return promotion.titles[language] ?? promotion.titles.fallback;
}
