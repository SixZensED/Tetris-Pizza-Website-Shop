import rawTranslations from "../data/translations.json";

type OrderTypeKey = "delivery" | "pickup";
export type FoodCategoryKey = "promotion" | "pizza" | "combo" | "chicken" | "drinks";

type TranslationBundle = {
  topbar: {
    loginCta: string;
    keyAlt: string;
    languageSelectorLabel: string;
    globeAlt: string;
    languageModalTitle: string;
    languageModalDescription: string;
  };
  orderType: {
    heading: string;
    options: Record<OrderTypeKey, string>;
  };
  banner: {
    emptyTitle: string;
    emptySubtitle: string;
    previousLabel: string;
    nextLabel: string;
  };
  foodCategories: {
    heading: string;
    items: Record<FoodCategoryKey, string>;
  };
  promotionCategories: {
    heading: string;
    viewAllLabel: string;
  };
};

const TRANSLATIONS = rawTranslations as Record<string, TranslationBundle>;

export type LanguageCode = Extract<keyof typeof TRANSLATIONS, string>;

const languageKeys = Object.keys(TRANSLATIONS) as LanguageCode[];
const fallbackLanguage = (languageKeys.find((code) => code === "TH") ?? languageKeys[0] ?? "EN") as LanguageCode;

export const SUPPORTED_LANGUAGES = languageKeys;
export const DEFAULT_LANGUAGE = fallbackLanguage;

export type TopBarCopy = TranslationBundle["topbar"];
export type OrderTypeCopy = TranslationBundle["orderType"];
export type BannerCopy = TranslationBundle["banner"];
export type FoodCategoriesCopy = TranslationBundle["foodCategories"];
export type PromotionCategoriesCopy = TranslationBundle["promotionCategories"];

export function isSupportedLanguage(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(code as LanguageCode);
}

export function getTranslations(language: LanguageCode): TranslationBundle {
  if (language in TRANSLATIONS) {
    return TRANSLATIONS[language];
  }
  return TRANSLATIONS[fallbackLanguage];
}

export function getTopBarCopy(language: LanguageCode): TopBarCopy {
  return getTranslations(language).topbar;
}

export function getOrderTypeCopy(language: LanguageCode): OrderTypeCopy {
  return getTranslations(language).orderType;
}

export function getBannerCopy(language: LanguageCode): BannerCopy {
  return getTranslations(language).banner;
}

export function getFoodCategoriesCopy(language: LanguageCode): FoodCategoriesCopy {
  return getTranslations(language).foodCategories;
}

export function getPromotionCategoriesCopy(language: LanguageCode): PromotionCategoriesCopy {
  return getTranslations(language).promotionCategories;
}
