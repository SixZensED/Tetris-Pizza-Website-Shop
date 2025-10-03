"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";

type LanguageCode = "TH" | "EN";

const LANGUAGE_OPTIONS: LanguageCode[] = ["TH", "EN"];

type CopyMap = {
  loginCta: string;
  keyAlt: string;
  languageSelectorLabel: string;
  globeAlt: string;
  languageModalTitle: string;
  languageModalDescription: string;
};

const COPY: Record<LanguageCode, CopyMap> = {
  TH: {
    loginCta: "เข้าสู่ระบบ / สมัครสมาชิก",
    keyAlt: "ไอคอนกุญแจ",
    languageSelectorLabel: "เลือกภาษา",
    globeAlt: "ไอคอนโลก",
    languageModalTitle: "เลือกภาษาในการใช้งาน",
    languageModalDescription: "คุณสามารถสลับภาษาเพื่อให้เหมาะกับการใช้งานได้",
  },
  EN: {
    loginCta: "Log in / Sign up",
    keyAlt: "Key icon",
    languageSelectorLabel: "Choose language",
    globeAlt: "Globe icon",
    languageModalTitle: "Choose your language",
    languageModalDescription: "Switch languages to match your preference.",
  },
};

export function TopBar() {
  const [language, setLanguage] = useState<LanguageCode>("TH");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("app_language");
    if (stored === "TH" || stored === "EN") {
      setLanguage(stored);
      return;
    }
    const browserLanguage = window.navigator.language.toLowerCase();
    if (browserLanguage.startsWith("en")) {
      setLanguage("EN");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("app_language", language);
  }, [language]);

  const copy = COPY[language];

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-24 w-full max-w-6xl items-center px-6">
        <BrandMark />
        <div className="ml-auto flex items-center gap-5">
          <AuthCta label={copy.loginCta} keyAlt={copy.keyAlt} />
          <LanguageTrigger
            language={language}
            label={copy.languageSelectorLabel}
            globeAlt={copy.globeAlt}
            isOpen={languageModalOpen}
            onOpen={() => setLanguageModalOpen(true)}
          />
        </div>
      </div>
      {languageModalOpen ? (
        <LanguageModal
          language={language}
          title={copy.languageModalTitle}
          description={copy.languageModalDescription}
          onClose={() => setLanguageModalOpen(false)}
          onSelect={handleLanguageSelect}
        />
      ) : null}
    </header>
  );
}

function BrandMark() {
  return (
    <Link href="/" className="flex h-30 w-30 mt-2 items-center justify-center">
      <Image
        src="/images/Logo.png"
        alt="โลโก้ Tetris Pizza"
        width={120}
        height={120}
        className="h-30 w-30 object-contain"
        priority
      />
    </Link>
  );
}

type AuthCtaProps = {
  label: string;
  keyAlt: string;
};

function AuthCta({ label, keyAlt }: AuthCtaProps) {
  return (
    <Link
      href="/auth/login"
      className="flex items-center gap-3 rounded-[10px] bg-[#b21807] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(178,24,7,0.25)] transition hover:bg-[#9c1506] hover:shadow-[0_14px_30px_rgba(156,21,6,0.28)]"
    >
      <KeyIcon className="h-4 w-4" alt={keyAlt} />
      <span>{label}</span>
    </Link>
  );
}

type LanguageTriggerProps = {
  language: LanguageCode;
  label: string;
  globeAlt: string;
  isOpen: boolean;
  onOpen: () => void;
};

function LanguageTrigger({ language, label, globeAlt, isOpen, onOpen }: LanguageTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={label}
    >
      <Image src="/globe.svg" alt={globeAlt} width={18} height={18} className="h-[18px] w-[18px]" priority={false} />
      <span>{language}</span>
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        className={`h-3 w-3 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
      >
        <path
          d="m4 6 4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type LanguageModalProps = {
  language: LanguageCode;
  title: string;
  description: string;
  onClose: () => void;
  onSelect: (code: LanguageCode) => void;
};

function LanguageModal({ language, title, description, onClose, onSelect }: LanguageModalProps) {
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const beginDismiss = useCallback(() => {
    setVisible(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        beginDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [beginDismiss]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleSelect = (code: LanguageCode) => {
    onSelect(code);
    beginDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        aria-label="Close language modal"
        onClick={beginDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
        aria-describedby="language-modal-description"
        className={`relative w-full max-w-sm transform rounded-3xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition-all duration-200 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="language-modal-title" className="text-lg font-semibold text-neutral-900">
              {title}
            </h2>
            <p id="language-modal-description" className="mt-1 text-sm text-neutral-500">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={beginDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
            aria-label="Close"
          >
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
            >
              <path
                d="M4.47 4.47 11.53 11.53M4.47 11.53 11.53 4.47"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {LANGUAGE_OPTIONS.map((code) => {
            const isActive = code === language;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#b21807] bg-[#b21807]/10 text-[#b21807]"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
                aria-pressed={isActive}
              >
                <span>{code}</span>
                {isActive ? (
                  <svg
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                  >
                    <path
                      d="M16.667 5.833 8.125 14.375 3.333 9.583"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type KeyIconProps = {
  className?: string;
  alt?: string;
};

function KeyIcon({ className, alt }: KeyIconProps) {
  return (
    <Image
      src="/images/LoginKey.png"
      alt={alt ?? "ไอคอนกุญแจ"}
      width={20}
      height={20}
      className={className ? `${className} object-contain` : "h-5 w-5 object-contain"}
      priority={false}
    />
  );
}
