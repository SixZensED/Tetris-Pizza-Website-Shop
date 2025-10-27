"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../contexts/CartContext";
import { getTopBarCopy } from "../../lib/translations";
import { useLanguageContext } from "../../contexts/language-context";
import { useAuthContext } from "@/app/contexts/AuthContext";

type TopBarCopy = ReturnType<typeof getTopBarCopy>;

// Constants
const LANGUAGE_OPTIONS = [
  { value: "EN", label: "EN" },
  { value: "TH", label: "TH" },
];
const TOPBAR_MAX_WIDTH = "max-w-[1440px]";

// --- Main TopBar Component ---
export function TopBar() {
    const { openOrderHistorySidebar, openCartSidebar, cart } = useCart();
  const { user, isAuthenticated, logout } = useAuthContext();
  
  const { language: currentLanguage, setLanguage } = useLanguageContext();
  const copy = getTopBarCopy(currentLanguage);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null); // Allow null for initial ref

  const itemCount =
    cart?.items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0,
    ) || 0;

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setProfileMenuOpen(false); // Close menu on logout
  }, [logout]);

  const toggleLanguageModal = useCallback(() => {
    setLanguageModalOpen((prev) => !prev);
  }, []);

  const handleLanguageSelect = useCallback(
    (lang: string) => {
      setLanguage(lang);
      setLanguageModalOpen(false);
    },
    [setLanguage],
  );

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      <div
        className={`mx-auto flex h-24 w-full items-center px-6 ${TOPBAR_MAX_WIDTH}`}
      >
        <BrandMark />

        <div className="ml-auto flex items-center gap-5">
          {isAuthenticated && (
            <button
              onClick={openOrderHistorySidebar}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2 -mr-2"
              aria-label="View Order History"
              title="Order History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 20.028V18H8v2.028c0 .277 0 .416.095.472s.224-.006.484-.13l1.242-.593c.088-.042.132-.063.179-.063s.091.02.179.063l1.242.593c.26.124.39.186.484.13c.095-.056.095-.195.095-.472" opacity="0.5" />
                <path fill="currentColor" d="M8 18h-.574c-1.084 0-1.462.006-1.753.068c-.513.11-.96.347-1.285.667c-.11.108-.164.161-.291.505s-.107.489-.066.78l.022.15c.11.653.31.998.616 1.244c.307.246.737.407 1.55.494c.837.09 1.946.092 3.536.092h4.43c1.59 0 2.7-.001 3.536-.092c.813-.087 1.243-.248 1.55-.494s.506-.591.616-1.243c.091-.548.11-1.241.113-2.171h-8v2.028c0 .277 0 .416-.095.472s-.224-.006-.484-.13l-1.242-.593c-.088-.042-.132-.063-.179-.063s-.091.02-.179.063l-1.242.593c-.26.124-.39.186-.484.13C8 20.444 8 20.305 8 20.028z" />
                <path fill="currentColor" d="M4.727 2.733c.306-.308.734-.508 1.544-.618C7.105 2.002 8.209 2 9.793 2h4.414c1.584 0 2.688.002 3.522.115c.81.11 1.238.31 1.544.618c.305.308.504.74.613 1.557c.112.84.114 1.955.114 3.552V18H7.426c-1.084 0-1.462.006-1.753.068c-.513.11-.96.347-1.285.667c-.11.108-.164.161-.291.505A1.3 1.3 0 0 0 4 19.7V7.842c0-1.597.002-2.711.114-3.552c.109-.816.308-1.249.613-1.557" opacity="0.5" />
                <path fill="currentColor" d="M7.25 7A.75.75 0 0 1 8 6.25h8a.75.75 0 0 1 0 1.5H8A.75.75 0 0 1 7.25 7M8 9.75a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5z" />
              </svg>
            </button>
          )}

          {/* Admin menu has been moved to the profile dropdown */}

          <button
            onClick={openCartSidebar}
            className="relative"
            aria-label="Open cart"
          >
            <CartIcon itemCount={itemCount} />
          </button>

          {isAuthenticated && (
            <Link href="/topup" className="text-gray-600 hover:text-gray-800 transition-colors p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M10 20h4c3.771 0 5.657 0 6.828-1.172S22 15.771 22 12c0-.442-.002-1.608-.004-2H2c-.002.392 0 1.558 0 2c0 3.771 0 5.657 1.171 6.828S6.23 20 10 20" opacity="0.5" />
	              <path fill="currentColor" d="M9.995 4h4.01c3.781 0 5.672 0 6.846 1.116c.846.803 1.083 1.96 1.149 3.884v1H2V9c.066-1.925.303-3.08 1.149-3.884C4.323 4 6.214 4 9.995 4M12.5 15.25a.75.75 0 0 0 0 1.5H14a.75.75 0 0 0 0-1.5zm-6.5 0a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5z" />
              </svg>
            </Link>
          )}

          {isAuthenticated && user ? (
            <UserProfileMenu
              currentUser={user}
              isOpen={profileMenuOpen}
              onToggle={toggleProfileMenu}
              onLogout={handleLogout}
              closeMenu={() => setProfileMenuOpen(false)}
              copy={copy}
              containerRef={profileMenuRef}
            />
          ) : (
            <AuthCta copy={copy} /> // Pass copy object
          )}

          <LanguageTrigger
            currentLanguage={currentLanguage}
            onClick={toggleLanguageModal}
            copy={copy}
            isOpen={languageModalOpen}
          />
        </div>
      </div>

      {languageModalOpen && (
        <LanguageModal
          isOpen={languageModalOpen}
          onClose={toggleLanguageModal}
          onSelectLanguage={handleLanguageSelect}
          currentLanguage={currentLanguage}
        />
      )}
    </header>
  );
}

// --- Sub-components (defined in this file for now) ---

function BrandMark() {
  return (
    <Link
      href="/"
      className="flex h-[70px] w-[70px] mt-2 items-center justify-center" // Increased size to 70px
    >
      <Image
        src="/images/Logo.png"
        alt="โลโก้ Tetris Pizza"
        width={120}
        height={120}
        className="h-[70px] w-[70px] object-contain" // Increased size to 70px
        priority
      />
    </Link>
  );
}

interface AuthCtaProps {
  copy: TopBarCopy;
}

function AuthCta({ copy }: AuthCtaProps) {
  return (
    <Link
      href="/auth/login"
      className="flex items-center gap-3 rounded-[10px] bg-[#b21807] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(178,24,7,0.25)] transition hover:bg-[#9c1506] hover:shadow-[0_14px_30px_rgba(156,21,6,0.28)]"
    >
      <KeyIcon className="h-4 w-4" alt={copy?.keyAlt || "Key icon"} />
      <span>{copy?.loginCta || "Login"}</span>
    </Link>
  );
}

interface UserProfileMenuProps {
  currentUser: {
    userId: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
    isAdmin?: boolean;
    balance?: string | number | null;
  };
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  closeMenu: () => void;
  copy: TopBarCopy;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function UserProfileMenu({
  currentUser,
  isOpen,
  onToggle,
  onLogout,
  closeMenu,
  copy,
  containerRef,
}: UserProfileMenuProps) {
  // Assuming balance is on currentUser for display
  const balanceDisplay = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(currentUser.balance || "0.00"));

  const displayName = currentUser.fullName || currentUser.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Profile menu"
        className="flex items-center gap-2 rounded-full p-1.5 text-neutral-700 hover:bg-neutral-100"
      >
        {currentUser.avatar ? (
          <Image
            src={currentUser.avatar}
            alt="User Avatar"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="text-neutral-500"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900">
              {currentUser.fullName}
            </p>
            {currentUser.email && (
              <p className="text-xs text-neutral-500 truncate">
                {currentUser.email}
              </p>
            )}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-neutral-500">{copy.coinsLabel}</span>
              <span className="text-sm font-semibold text-yellow-600">
                ฿{new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(Number(currentUser.balance || 0))}
              </span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/account-settings"
              onClick={closeMenu}
              className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3 h-5 w-5 text-neutral-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              {copy.accountSettingsLabel}
            </Link>

            {currentUser.role === 'admin' && (
              <Link
                href="/admin/orders"
                onClick={closeMenu}
                className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-3 h-5 w-5 text-neutral-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                {copy.adminLabel}
              </Link>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3 h-5 w-5 text-neutral-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              {copy.logoutLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface LanguageTriggerProps {
  currentLanguage: string;
  onClick: () => void;
  copy: TopBarCopy;
  isOpen: boolean;
}

function LanguageTrigger({
  currentLanguage,
  onClick,
  copy,
  isOpen,
}: LanguageTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
      aria-haspopup="dialog"
      aria-expanded={isOpen ? "true" : "false"}
    >
      <Image
        src="/globe.svg"
        alt={copy.globeAlt}
        width={18}
        height={18}
        priority={false}
      />
      <span>{currentLanguage.toUpperCase()}</span>
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        className={`ml-1 h-3 w-3 text-neutral-500 transition-transform duration-200 ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
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

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: string) => void;
  currentLanguage: string;
}

function LanguageModal({
  isOpen,
  onClose,
  onSelectLanguage,
  currentLanguage,
}: LanguageModalProps) {
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => setVisible(true), 12);
      return () => {
        window.clearTimeout(timer);
      };
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const beginDismiss = useCallback(() => {
    setVisible(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(onClose, 180);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    beginDismiss();
  };

  if (!isOpen && !visible) return null; // Only render when open or transitioning out

  const copy = getTopBarCopy(currentLanguage); // Get translations for modal content

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
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
            <h2
              id="language-modal-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {copy.languageModalTitle}
            </h2>
            <p
              id="language-modal-description"
              className="mt-1 text-sm text-neutral-500"
            >
              {copy.languageModalDescription}
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
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.value === currentLanguage;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#b21807] bg-[#b21807]/10 text-[#b21807]"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
                aria-pressed={isActive}
              >
                <span>{option.label}</span>
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

interface KeyIconProps {
  className?: string;
  alt?: string;
}

function KeyIcon({ className, alt }: KeyIconProps) {
  return (
    <Image
      src="/images/LoginKey.png"
      alt={alt ?? "ไอคอนกุญแจเข้าสู่ระบบ"}
      width={20}
      height={20}
      className={
        className ? `${className} object-contain` : "h-5 w-5 object-contain"
      }
      priority={false}
    />
  );
}

interface CartIconProps {
  itemCount: number;
}

function CartIcon({ itemCount }: CartIconProps) {
  return (
    <div className="relative">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
        className="text-neutral-700"
      >
        <path 
          fill="currentColor" 
          d="M10 2a1.75 1.75 0 1 0 0 3.5h4A1.75 1.75 0 1 0 14 2zM3.863 16.205c-.858-3.432-1.287-5.147-.386-6.301S6.147 8.75 9.684 8.75h4.63c3.538 0 5.307 0 6.208 1.154s.472 2.87-.386 6.301c-.546 2.183-.819 3.274-1.633 3.91c-.813.635-1.938.635-4.188.635h-4.63c-2.25 0-3.376 0-4.19-.635c-.813-.636-1.086-1.727-1.632-3.91" 
          opacity="0.5" 
        />
        <path 
          fill="currentColor" 
          d="M15.58 4.502a1.74 1.74 0 0 0 .002-1.501c.683.005 1.216.036 1.692.222a3.25 3.25 0 0 1 1.426 1.09c.367.494.54 1.127.776 1.998l.047.17l.512 2.964c-.408-.282-.935-.45-1.617-.55l-.361-2.087c-.284-1.04-.387-1.367-.561-1.601a1.75 1.75 0 0 0-.768-.587c-.22-.086-.486-.111-1.148-.118M8.418 3a1.74 1.74 0 0 0 .002 1.502c-.662.007-.928.032-1.148.118a1.75 1.75 0 0 0-.768.587c-.174.234-.277.561-.56 1.6l-.362 2.089c-.681.1-1.208.267-1.617.548l.512-2.962l.047-.17c.237-.872.41-1.506.776-2a3.25 3.25 0 0 1 1.426-1.089c.476-.186 1.008-.217 1.692-.222m.332 9.749a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM16 12a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4A.75.75 0 0 1 16 12m-3.25.75a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0z" 
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {itemCount}
        </span>
      )}
    </div>
  );
}

// Default export for Next.js app router
export default TopBar;
