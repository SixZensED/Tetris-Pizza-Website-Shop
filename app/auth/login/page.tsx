"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [touchedPwd, setTouchedPwd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  // Format Thai mobile number (3-3-4)
  const formatThaiPhone = (digits: string) => {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };
  const handleGoogleLogin = () => {
    // Demo only; replace with real OAuth (e.g., NextAuth Google provider)
    alert("กำลังเข้าสู่ระบบด้วย Google (ตัวอย่าง)");
  };

  const isValid = useMemo(() => {
    if (mode === "phone") {
      // Allow only digits; Thai mobile numbers are typically 10 digits and start with 0
      const digits = value.replace(/\D/g, "");
      return /^0\d{9}$/.test(digits);
    }
    // Email login requires valid email and minimum password length
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    const pwdOk = password.length >= 6;
    return emailOk && pwdOk;
  }, [mode, value, password]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    // Mock submit – replace with your real auth later
    try {
      const name =
        mode === "email"
          ? (value.split("@")[0] || "John Doe").replace(/[^a-zA-Z]/g, "")
          : "John Doe";
      localStorage.setItem("demo_user_name", name);
    } catch {}
    setSuccess(true);
  };

  const errorText = useMemo(() => {
    if (!touched || value.length === 0 || isValid) return "";
    return mode === "phone"
      ? "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)"
      : "กรุณากรอกอีเมลให้ถูกต้อง";
  }, [mode, touched, value, isValid]);

  const pwdError = useMemo(() => {
    if (mode !== "email") return "";
    if (!touchedPwd) return "";
    return password.length >= 6 ? "" : "กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร";
  }, [mode, touchedPwd, password]);

  const label = mode === "phone" ? "เบอร์โทรศัพท์ *" : "อีเมล *";
  const placeholder = mode === "phone" ? "กรอกเบอร์โทรศัพท์" : "กรอกอีเมล";

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          กลับ
        </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded-2xl bg-white shadow-sm border border-neutral-200/70 p-6 md:p-10"
          >
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 leading-snug">
            เข้าสู่ระบบ
          </h1>

          <form onSubmit={onSubmit} className="mt-8">
            <label className="block text-sm font-semibold text-neutral-800 mb-2">
              {label}
            </label>

            <input
              type={mode === "email" ? "email" : "tel"}
              inputMode={mode === "email" ? undefined : "numeric"}
              value={value}
              onChange={(e) => {
                const input = e.target.value;
                if (mode === "phone") {
                  const digits = input.replace(/\D/g, "").slice(0, 10);
                  setValue(formatThaiPhone(digits));
                } else {
                  setValue(input);
                }
              }}
              onBlur={() => setTouched(true)}
              placeholder={placeholder}
              className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-400 outline-none transition shadow-sm ${
                errorText && touched
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
              }`}
              aria-invalid={!!(errorText && touched)}
              aria-describedby={errorText ? "login-error" : undefined}
            />

            {errorText ? (
              <p id="login-error" className="mt-2 text-sm text-rose-600">
                {errorText}
              </p>
            ) : null}

            {mode === "email" && (
              <div className="mt-5">
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  รหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouchedPwd(true)}
                    placeholder="กรอกรหัสผ่าน"
                    className={`w-full rounded-lg border pr-11 px-4 py-3 text-[15px] text-neutral-500 outline-none transition shadow-sm ${
                      pwdError
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                    }`}
                    aria-invalid={!!pwdError}
                    aria-describedby={pwdError ? "pwd-error" : undefined}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    whileTap={{ scale: 0.9 }}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l22 22" /><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.01 1.1-1.97 1.87-2.82M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8-1.02 2.25-2.76 4.17-4.88 5.43" /><path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                    </motion.button>
                  </div>
                {pwdError ? (
                  <p id="pwd-error" className="mt-2 text-sm text-rose-600">
                    {pwdError}
                  </p>
                ) : null}
                <div className="mt-2 text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-neutral-700 hover:underline">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
              </div>
            )}

              <motion.button
                type="submit"
                disabled={!isValid}
                whileHover={isValid ? { scale: 1.02 } : undefined}
                whileTap={isValid ? { scale: 0.98 } : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
                className={`mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                  isValid
                    ? "bg-[#b21807] text-white hover:bg-[#890b00]/90"
                    : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                }`}
              >
                ดำเนินการต่อ
              </motion.button>

            <div className="my-6 flex items-center gap-3 text-neutral-400">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-sm text-neutral-500">หรือ</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
                className="mt-3 w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 inline-flex items-center justify-center gap-2 mb-2"
                aria-label="เข้าสู่ระบบด้วย Google"
              >
                <Image
                  src="/images/Google Icon.png"
                  alt="โลโก้ Google"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                  priority={false}
                />
                เข้าสู่ระบบด้วย Google
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  setMode((m) => (m === "phone" ? "email" : "phone"));
                  setValue("");
                  setTouched(false);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
                className="w-full rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-2 group"
              >
                {mode === "phone" ? (
                  <>
                    {/* Email icon (adapted to use currentColor) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="transition-transform group-hover:-translate-y-[1px]">
                      <path fill="currentColor" d="m20 8l-8 5l-8-5V6l8 5l8-5m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2" />
                    </svg>
                    เข้าสู่ระบบด้วยอีเมล
                  </>
                ) : (
                  <>
                    {/* Phone icon (adapted to use currentColor) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="transition-transform group-hover:-translate-y-[1px]">
                      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                        <rect width="12.5" height="18.5" x="5.75" y="2.75" rx="3" />
                        <path d="M11 17.75h2" />
                      </g>
                    </svg>
                    เข้าสู่ระบบด้วยเบอร์โทรศัพท์
                  </>
                )}
              </motion.button>

            <p className="mt-6 text-center text-sm text-neutral-600">
              ยังไม่มีบัญชีใช่หรือไม่
              <Link href="/auth/register" className="ml-2 font-semibold text-neutral-900 hover:underline">
                สร้างบัญชี
              </Link>
            </p>
          </form>
          </motion.div>
      </section>
    </main>
  );
}
