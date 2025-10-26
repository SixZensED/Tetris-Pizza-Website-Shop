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
    profileMenuLabel: string;
    profileFallbackName: string;
    logoutLabel: string;
    viewProfileLabel: string;
    coinsLabel: string;
    accountSettingsLabel: string;
    adminLabel: string;
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
  CartSidebar: {
    yourCart: string;
    total: string;
    checkout: string;
    emptyCart: string;
    loading: string;
    remove: string;
    close: string;
    confirmRemove: string;
    confirmRemoveText: string;
    confirmPurchase: string;
    confirmPurchaseText: string;
    insufficientBalance: string;
    processingPayment: string;
    paymentSuccess: string;
    paymentFailed: string;
    yes: string;
    no: string;
    yourBalance: string;
  };
  OrderHistorySidebar: {
    title: string;
    closeAriaLabel: string;
    loading: string;
    noOrders: string;
    tryOrdering: string;
    orderId: string;
    orderDate: string;
    totalPrice: string;
    paymentMethod: string;
    items: string;
    quantity: string;
    noImage: string;
    status: {
      pending_delivery: string;
      completed: string;
      cancelled: string;
    };
    error: {
      loginRequired: string;
      authError: string;
      loadError: string;
    };
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
export type CartSidebarCopy = TranslationBundle["CartSidebar"];
export type OrderHistorySidebarCopy = TranslationBundle["OrderHistorySidebar"];

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

export function getCartSidebarCopy(language: LanguageCode): CartSidebarCopy {
  return getTranslations(language).CartSidebar;
}

export function getOrderHistoryCopy(language: LanguageCode): OrderHistorySidebarCopy {
  return getTranslations(language).OrderHistorySidebar;
}
