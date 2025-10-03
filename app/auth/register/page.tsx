"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PolicyModal from "../../components/policy-modal";
import { Checkbox, Radio } from "../../components/controls";
import DatePicker from "../../components/date-picker";
import SuccessModal from "../../components/success-modal";
import { scanBadWords, addBadWords } from "@sit-sandbox/thai-bad-words";

type Gender = "male" | "female" | "unspecified";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [policy, setPolicy] = useState<null | "terms" | "privacy">(null);
  const [success, setSuccess] = useState(false);

  // state สำหรับตรวจคำหยาบ
  const [badFirstName, setBadFirstName] = useState(false);
  const [badLastName, setBadLastName] = useState(false);

  // ✅ ฟังก์ชันตรวจคำหยาบ (async + await)
  const hasBadWord = async (text: string): Promise<boolean> => {
    try {
      await scanBadWords(text);
      return false;
    } catch {
      return true;
    }
  };

  // Format Thai mobile number (3-3-4)
  const formatThaiPhone = (digits: string) => {
    const d = digits.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const isPhoneValid = useMemo(() => /^0\d{9}$/.test(phone.replace(/\D/g, "")), [phone]);
  const isEmailValid = useMemo(
    () => email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()),
    [email]
  );

  const isValid = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      birth.trim().length > 0 &&
      isPhoneValid &&
      isEmailValid &&
      acceptTerms &&
      !badFirstName &&
      !badLastName
    );
  }, [firstName, lastName, birth, isPhoneValid, isEmailValid, acceptTerms, badFirstName, badLastName]);

  const markTouched = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ["firstName", "lastName", "phone", "birth", "email", "terms"].forEach(markTouched);

    const firstBad = await hasBadWord(firstName);
    const lastBad = await hasBadWord(lastName);
    setBadFirstName(firstBad);
    setBadLastName(lastBad);
    if (firstBad || lastBad) return;

    if (!isValid) return;
    try {
      const name = firstName?.trim() || "ผู้ใช้";
      localStorage.setItem("demo_user_name", name);
      localStorage.setItem(
        "demo_user",
        JSON.stringify({ firstName, lastName, phone: phone.replace(/\D/g, ""), birth, email, gender })
      );
    } catch {}
    setSuccess(true);
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-3xl">
        <Link
          href="/auth/login"
          className="mb-4 inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            สร้างบัญชีผู้ใช้ใหม่
          </h1>

          <form onSubmit={onSubmit} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ชื่อ */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-neutral-800 mb-2">
                  ชื่อ *
                </label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={async () => {
                    markTouched("firstName");
                    setBadFirstName(await hasBadWord(firstName));
                  }}
                  placeholder="ชื่อ"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-400 outline-none transition shadow-sm ${
                    touched.firstName && (firstName.trim() === "" || badFirstName)
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.firstName && badFirstName && (
                  <p className="mt-2 text-sm text-rose-600">กรุณาใช้ชื่อที่เหมาะสม</p>
                )}
              </div>

              {/* นามสกุล */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-neutral-800 mb-2">
                  นามสกุล *
                </label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={async () => {
                    markTouched("lastName");
                    setBadLastName(await hasBadWord(lastName));
                  }}
                  placeholder="นามสกุล"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-400 outline-none transition shadow-sm ${
                    touched.lastName && (lastName.trim() === "" || badLastName)
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.lastName && badLastName && (
                  <p className="mt-2 text-sm text-rose-600">กรุณาใช้นามสกุลที่เหมาะสม</p>
                )}
              </div>
            </div>

            {/* เบอร์โทร */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-neutral-800 mb-2">
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(formatThaiPhone(digits));
                  }}
                  onBlur={() => markTouched("phone")}
                  placeholder="เบอร์โทรศัพท์"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-400 outline-none transition shadow-sm ${
                    touched.phone && !isPhoneValid
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.phone && !isPhoneValid && (
                  <p className="mt-2 text-sm text-rose-600">กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)</p>
                )}
              </div>

              {/* วันเกิด */}
              <div>
                <label htmlFor="birth" className="block text-sm font-semibold text-neutral-800 mb-2">
                  วันเกิด *
                </label>
                <DatePicker
                  id="birth"
                  value={birth}
                  onChange={(iso) => setBirth(iso)}
                  className={`${touched.birth && birth.trim() === "" ? "ring-2 ring-rose-200" : ""}`}
                />
              </div>
            </div>

            {/* อีเมล และ เพศ */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-800 mb-2">
                  อีเมล*
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  placeholder="อีเมล"
                  className={`w-full rounded-lg border px-4 py-3 text-[15px] text-neutral-400 outline-none transition shadow-sm ${
                    touched.email && !isEmailValid
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-neutral-300 focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
                  }`}
                />
                {touched.email && !isEmailValid && (
                  <p className="mt-2 text-sm text-rose-600">กรุณากรอกอีเมลให้ถูกต้อง</p>
                )}
              </div>

              <div>
                <span className="block text-sm font-semibold text-neutral-800 mb-2">เพศ *</span>
                <div className="flex items-center gap-4">
                  <Radio name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")}>
                    ชาย
                  </Radio>
                  <Radio name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")}>
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
            </div>

            <hr className="my-6 border-neutral-200" />

            {/* การยอมรับข้อตกลง */}
            <Checkbox checked={acceptTerms} onChange={setAcceptTerms} onBlur={() => markTouched("terms")}>
              ฉันได้อ่านและยอมรับ
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
              และ
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
              <p className="mt-2 text-sm text-rose-600">โปรดยอมรับข้อตกลงและนโยบายก่อนดำเนินการต่อ</p>
            )}

            {/* การรับข่าวสาร */}
            <div className="mt-4">
              <Checkbox checked={acceptMarketing} onChange={setAcceptMarketing}>
                ฉันยินยอมรับข่าวสาร กิจกรรมและโปรโมชั่นต่างๆ จากบริษัทในเครือ
                <Link href="#" className="ml-1 underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </Checkbox>
            </div>

            {/* ปุ่มส่งฟอร์ม */}
            <motion.button
              type="submit"
              disabled={!isValid}
              whileHover={isValid ? { scale: 1.02 } : undefined}
              whileTap={isValid ? { scale: 0.98 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
              className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                isValid
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
              }`}
            >
              สร้างบัญชี
            </motion.button>

            <p className="mt-6 text-center text-sm text-neutral-600">
              มีบัญชีอยู่แล้วใช่ไหม
              <Link href="/auth/login" className="ml-2 font-semibold text-neutral-900 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </motion.div>
        <PolicyModal open={policy !== null} onClose={() => setPolicy(null)} type={policy ?? "terms"} />
        <SuccessModal open={success} onClose={() => setSuccess(false)} />
      </section>
    </main>
  );
}
