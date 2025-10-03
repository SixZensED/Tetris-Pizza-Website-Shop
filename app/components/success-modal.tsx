"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

type ModalType = "register" | "login";

export default function SuccessModal({
  open,
  onClose,
  type = "register", // << เพิ่มค่า default เป็น register
  title,
  subtitle,
  primaryHref,
  primaryText,
}: {
  open: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryText?: string;
}) {
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

  // กำหนดข้อความตาม type หากไม่ได้ส่ง prop title / subtitle / primaryText เข้ามา
  const defaultTitle =
    type === "register" ? "สมัครสมาชิกสำเร็จ!" : "เข้าสู่ระบบสำเร็จ!";
  const defaultSubtitle =
    type === "register"
      ? "บัญชีของคุณถูกสร้างเรียบร้อยแล้ว ยินดีต้อนรับสู่ระบบ"
      : "คุณได้เข้าสู่ระบบเรียบร้อยแล้ว";
  const defaultHref = type === "register" ? "/auth/login" : "/";
  const defaultPrimaryText =
    type === "register" ? "ไปเข้าสู่ระบบ" : "ไปหน้าแรก";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9500] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || defaultTitle}
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-[1] w-[92vw] max-w-md overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl p-6 md:p-7 shadow-2xl border border-neutral-200 text-center"
          >
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 via-lime-400 to-teal-500" />

            <div className="mx-auto mb-4 mt-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-500 text-white shadow-md ring-4 ring-emerald-100">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-neutral-900">
              {title || defaultTitle}
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              {subtitle || defaultSubtitle}
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href={primaryHref || defaultHref}
                className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800"
                onClick={onClose}
              >
                {primaryText || defaultPrimaryText}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
