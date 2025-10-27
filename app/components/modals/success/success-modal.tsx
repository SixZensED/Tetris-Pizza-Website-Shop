"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ModalType = "register" | "login";

export default function SuccessModal({
  open,
  onClose,
  type = "register",
  variant = "success",
  title,
  subtitle,
  primaryHref,
  primaryText,
  onPrimaryAction,
  autoRedirectDelay,
}: {
  open: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryText?: string;
  onPrimaryAction?: () => void;
  autoRedirectDelay?: number;
  variant?: 'success' | 'error';
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onClose]);

  useEffect(() => {
    if (open && autoRedirectDelay && primaryHref) {
      const timer = setTimeout(() => {
        router.push(primaryHref);
        onClose();
      }, autoRedirectDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoRedirectDelay, primaryHref, router, onClose]);

  const defaultTitle =
    type === "register"
      ? "สมัครสมาชิกสำเร็จ!"
      : type === "login"
        ? "เข้าสู่ระบบสำเร็จ!"
        : "ออกจากระบบสำเร็จ!";

  const defaultSubtitle =
    type === "register"
      ? "บัญชีของคุณถูกสร้างเรียบร้อยแล้ว"
      : type === "login"
        ? "ยินดีต้อนรับกลับมา!"
        : "กำลังพาคุณไป...";

  const defaultHref = type === "register" ? "/auth/login" : "/";
  const defaultPrimaryText =
    type === "register"
      ? "ไปเข้าสู่ระบบ"
      : type === "login"
        ? "ตกลง"
        : "กลับสู่หน้าหลัก";

  const handlePrimaryClick = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9500] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || defaultTitle}
            initial={{ y: 20, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center shadow-xl"
          >
            <div className="mb-6 flex justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.1,
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="flex h-16 w-16 items-center justify-center rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                >
                  <defs>
                    <mask id="SVG4IxzvcIZ">
                      <g
                        fill="none"
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4"
                      >
                        <path
                          fill="#555555"
                          d="m24 4l5.253 3.832l6.503-.012l1.997 6.188l5.268 3.812L41 24l2.021 6.18l-5.268 3.812l-1.997 6.188l-6.503-.012L24 44l-5.253-3.832l-6.503.012l-1.997-6.188l-5.268-3.812L7 24l-2.021-6.18l5.268-3.812l1.997-6.188l6.503.012z"
                        />
                        {variant === 'error' ? (
                          <path d="m16 16l16 16m0-16L16 32" />
                        ) : (
                          <path d="m17 24l5 5l10-10" />
                        )}
                      </g>
                    </mask>
                  </defs>
                  <path
                    fill={variant === 'error' ? '#dc2626' : '#16a34a'}
                    d="M0 0h48v48H0z"
                    mask="url(#SVG4IxzvcIZ)"
                  />
                </svg>
              </motion.div>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900">
              {title || defaultTitle}
            </h3>
            <p className="mt-3 text-neutral-500">
              {autoRedirectDelay
                ? "กำลังพาคุณไป..."
                : subtitle || defaultSubtitle}
            </p>

            {!autoRedirectDelay && (
              <div className="mt-8">
                {onPrimaryAction ? (
                  <button
                    type="button"
                    className={`block w-full rounded-lg px-5 py-3 font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-[#b21807] hover:bg-[#9c1506] focus:ring-red-400'}`}
                    onClick={handlePrimaryClick}
                  >
                    {primaryText || defaultPrimaryText}
                  </button>
                ) : (
                  <Link
                    href={primaryHref || defaultHref}
                    className={`block w-full rounded-lg px-5 py-3 font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-[#b21807] hover:bg-[#9c1506] focus:ring-red-400'}`}
                    onClick={handlePrimaryClick}
                  >
                    {primaryText || defaultPrimaryText}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
