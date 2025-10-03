"use client";

import { useState } from "react";

type OrderType = "delivery" | "pickup";

type OrderOption = {
  key: OrderType;
  label: string;
};

const OPTIONS: OrderOption[] = [
  { key: "delivery", label: "ส่งถึงบ้าน" },
  { key: "pickup", label: "รับที่ร้าน" },
];

export function OrderTypeSection() {
  const [selection, setSelection] = useState<OrderType>("delivery");
  const activeIndex = Math.max(
    OPTIONS.findIndex((option) => option.key === selection),
    0,
  );

  return (
    <section className="mt-[-12px]">
      <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#ededed] px-6 py-10">
        <div className="flex w-full max-w-4xl flex-col items-start text-left pl-6 md:pl-10 lg:pl-170">
          <h2 className="text-xl font-bold text-[#515151] tracking-tight">
            เลือกประเภทการสั่งซื้อ
          </h2>
          <div className="mt-6 inline-flex items-center justify-center self-start rounded-[18px] border border-[#d0d0d0] bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <div className="relative inline-flex min-w-[296px] overflow-hidden rounded-[14px]">
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-[14px] bg-[#b21807] shadow-[0_6px_12px_rgba(178,24,7,0.3)] transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
              />
              {OPTIONS.map((option) => {
                const isActive = option.key === selection;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelection(option.key)}
                    className={`relative z-10 flex-1 min-w-[148px] px-6 py-2.5 text-base font-semibold text-center transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isActive
                        ? "text-white focus-visible:outline-[#b21807]"
                        : "text-[#5a5a5a] hover:text-[#2e2e2e] focus-visible:outline-[#9f9f9f]"
                    }`}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
