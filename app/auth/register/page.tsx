"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PolicyModal from "../../components/modals/policy/policy-modal";
import { Checkbox, Radio } from "../../components/common/controls";
import DatePicker from "../../components/common/date-picker";
import SuccessModal from "../../components/modals/success/success-modal";
import { scanBadWords } from "@sit-sandbox/thai-bad-words";

type Gender = "male" | "female" | "unspecified";

const EyeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeClosedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<Gender>("unspecified");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [policy, setPolicy] = useState<null | "terms" | "privacy">(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [badFirstName, setBadFirstName] = useState(false);
  const [badLastName, setBadLastName] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ตรวจคำหยาบ (async)
  const hasBadWord = async (text: string): Promise<boolean> => {
    try {
      await scanBadWords(text);
      return false;
    } catch {
      return true;
    }
  };

  // ฟอร์แมตเบอร์โทร 3-3-4
  const formatThaiPhone = (digits: string) => {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const isPhoneValid = useMemo(
    () => /^0\d{9}$/.test(phone.replace(/\D/g, "")),
    [phone],
  );
  const isEmailValid = useMemo(
    () =>
      email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()),
    [email],
  );
  const isPasswordValid = useMemo(
    () => password.trim().length >= 8,
    [password],
  );
  const isConfirmPasswordValid = useMemo(
    () => password === confirmPassword,
    [password, confirmPassword],
  );

  const isValid = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      birth.trim() &&
      isPhoneValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid &&
      acceptTerms &&
      !badFirstName &&
      !badLastName
    );
  }, [
    firstName,
    lastName,
    birth,
    isPhoneValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    acceptTerms,
    badFirstName,
    badLastName,
  ]);

  const markTouched = (key: string) =>
    setTouched((t) => ({ ...t, [key]: true }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    [
      "firstName",
      "lastName",
      "phone",
      "birth",
      "email",
      "password",
      "confirmPassword",
      "terms",
    ].forEach(markTouched);

    const firstBad = await hasBadWord(firstName);
    const lastBad = await hasBadWord(lastName);
    setBadFirstName(firstBad);
    setBadLastName(lastBad);
    if (firstBad || lastBad) return;

    if (!isValid) return;

    if (!apiBaseUrl) {
      setServerError("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_API_BASE_URL");
      return;
    }

    const fullName = [firstName.trim(), lastName.trim()].join(" ");
    const payload = {
      email: email.trim(),
      password: password.trim(),
      fullName: fullName || "ผู้ใช้",
      phoneNumber: phone.replace(/\D/g, ""),
      gender,
      birthdate: birth,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
        throw new Error(message);
      }

      localStorage.setItem("demo_user_name", fullName || "ผู้ใช้");
      localStorage.setItem(
        "demo_user",
        JSON.stringify({
          firstName,
          lastName,
          phone: payload.phoneNumber,
          birth,
          email,
          gender,
          points: 0,
        }),
      );

      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-3xl">
        <Link
          href="/auth/login"
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
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
            สร้างบัญชีผู้ใช้ใหม่
          </h1>

          <form onSubmit={onSubmit} className="mt-8">
            {serverError && (
              <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {serverError}
              </p>
            )}

            {/* ชื่อ / นามสกุล */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  ชื่อ *
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={async () => {
                    markTouched("firstName");
                    setBadFirstName(await hasBadWord(firstName));
                  }}
                  placeholder="ชื่อ"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-600 outline-none transition shadow-sm ${
                    touched.firstName &&
                    (firstName.trim() === "" || badFirstName)
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.firstName && badFirstName && (
                  <p className="mt-2 text-sm text-rose-600">
                    กรุณาใช้ชื่อที่เหมาะสม
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  นามสกุล *
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={async () => {
                    markTouched("lastName");
                    setBadLastName(await hasBadWord(lastName));
                  }}
                  placeholder="นามสกุล"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-600 outline-none transition shadow-sm ${
                    touched.lastName && (lastName.trim() === "" || badLastName)
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.lastName && badLastName && (
                  <p className="mt-2 text-sm text-rose-600">
                    กรุณาใช้นามสกุลที่เหมาะสม
                  </p>
                )}
              </div>
            </div>

            {/* เบอร์โทร / วันเกิด */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setPhone(formatThaiPhone(digits));
                  }}
                  onBlur={() => markTouched("phone")}
                  placeholder="เบอร์โทรศัพท์"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-600 outline-none transition shadow-sm ${
                    touched.phone && !isPhoneValid
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.phone && !isPhoneValid && (
                  <p className="mt-2 text-sm text-rose-600">
                    กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  วันเกิด *
                </label>
                <DatePicker
                  value={birth}
                  onChange={(iso) => setBirth(iso)}
                  className={`${touched.birth && birth.trim() === "" ? "ring-2 ring-rose-200" : ""}`}
                />
              </div>
            </div>

            {/* อีเมล */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-neutral-800 mb-2">
                อีเมล *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                placeholder="อีเมล"
                className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-600 outline-none transition shadow-sm ${
                  touched.email && !isEmailValid
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                }`}
              />
              {touched.email && !isEmailValid && (
                <p className="mt-2 text-sm text-rose-600">
                  กรุณากรอกอีเมลให้ถูกต้อง
                </p>
              )}
            </div>

            {/* รหัสผ่าน / ยืนยันรหัสผ่าน */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  รหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched("password")}
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    className={`w-full rounded-lg border pr-10 px-4 py-3 text-[15px] text-neutral-600 outline-none transition shadow-sm ${
                      touched.password && !isPasswordValid
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                {touched.password && !isPasswordValid && (
                  <p className="mt-2 text-sm text-rose-600">
                    รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  ยืนยันรหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => markTouched("confirmPassword")}
                    placeholder="ยืนยันรหัสผ่าน"
                    className={`w-full rounded-lg border pr-10 px-4 py-3 text-[15px] text-neutral-600 outline-none transition shadow-sm ${
                      touched.confirmPassword && !isConfirmPasswordValid
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                {touched.confirmPassword && !isConfirmPasswordValid && (
                  <p className="mt-2 text-sm text-rose-600">
                    รหัสผ่านไม่ตรงกัน
                  </p>
                )}
              </div>
            </div>

            {/* เพศ */}
            <div className="mt-4">
              <span className="block text-sm font-semibold text-neutral-800 mb-2">
                เพศ *
              </span>
              <div className="flex items-center gap-4">
                <Radio
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                >
                  ชาย
                </Radio>
                <Radio
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                >
                  หญิง
                </Radio>
                <Radio
                  name="gender"
                  value="unspecified"
                  checked={gender === "unspecified"}
                  onChange={() => setGender("unspecified")}
                >
                  ไม่ระบุ
                </Radio>
              </div>
            </div>

            <hr className="my-6 border-neutral-200" />

            {/* ข้อตกลง */}
            <Checkbox
              checked={acceptTerms}
              onChange={setAcceptTerms}
              onBlur={() => markTouched("terms")}
            >
              ฉันได้อ่านและยอมรับ{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPolicy("terms");
                }}
                className="mx-1 underline hover:text-neutral-900"
              >
                ข้อกำหนดการใช้งาน
              </button>
              และ{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPolicy("privacy");
                }}
                className="mx-1 underline hover:text-neutral-900"
              >
                นโยบายความเป็นส่วนตัว
              </button>
              ของบริการนี้
            </Checkbox>
            {touched.terms && !acceptTerms && (
              <p className="mt-2 text-sm text-rose-600">
                โปรดยอมรับข้อตกลงและนโยบายก่อนดำเนินการต่อ
              </p>
            )}

            {/* ข่าวสาร */}
            <div className="mt-4">
              <Checkbox checked={acceptMarketing} onChange={setAcceptMarketing}>
                ฉันยินยอมรับข่าวสาร กิจกรรม และโปรโมชั่นต่างๆ จากบริษัทในเครือ
              </Checkbox>
            </div>

            {/* ปุ่มส่ง */}
            <motion.button
              type="submit"
              disabled={!isValid || isSubmitting}
              whileHover={isValid ? { scale: 1.02 } : undefined}
              whileTap={isValid ? { scale: 0.98 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                isValid
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "กำลังสมัคร..." : "สร้างบัญชี"}
            </motion.button>

            <p className="mt-6 text-center text-sm text-neutral-600">
              มีบัญชีอยู่แล้วใช่ไหม
              <Link
                href="/auth/login"
                className="ml-2 font-semibold text-neutral-900 hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </motion.div>

        <PolicyModal
          open={policy !== null}
          onClose={() => setPolicy(null)}
          type={policy ?? "terms"}
        />
        <SuccessModal
          open={success}
          onClose={() => setSuccess(false)}
          type="register"
          autoRedirectDelay={2000}
          primaryHref="/auth/login"
        />
      </section>
    </main>
  );
}
