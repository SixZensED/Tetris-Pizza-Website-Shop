"use client";

import { useState, useEffect } from "react";
import { useLanguageContext } from "../../contexts/language-context";
import { getOrderTypeCopy } from "../../lib/translations";

type OrderType = "delivery" | "pickup";

const ORDER_TYPES: OrderType[] = ["delivery", "pickup"];

const SECTION_MAX_WIDTH = "max-w-[1440px]";

export function OrderTypeSection() {
  const { language } = useLanguageContext();
  const [selection, setSelection] = useState<OrderType>("delivery");
  const orderCopy = getOrderTypeCopy(language);
  const activeIndex = Math.max(ORDER_TYPES.indexOf(selection), 0);

  useEffect(() => {
    const fetchOrderType = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
          const response = await fetch(`${apiBaseUrl}/api/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.orderType) {
              setSelection(data.orderType);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchOrderType();
  }, []);


  const handleSelectionChange = async (newSelection: OrderType) => {
    setSelection(newSelection);

    const token = localStorage.getItem("token");

    if (token) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        await fetch(`${apiBaseUrl}/api/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderType: newSelection }),
        });
      } catch (error) {
        console.error("An error occurred while updating order type:", error);
      }
    }
  };

  return (
    <section className="mt-[-12px]">
      <div className=" bg-[#ededed]">
        <div className={`mx-auto w-full ${SECTION_MAX_WIDTH} px-6 py-10`}>
          <div className="flex w-full flex-col items-start text-left">
            <h2 className="text-xl font-bold tracking-tight text-[#515151]">
              {orderCopy.heading}
            </h2>
            <div className="mt-6 inline-flex items-center justify-center rounded-[18px] border border-[#d0d0d0] bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="relative inline-flex min-w-[296px] overflow-hidden rounded-[14px]">
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-[14px] bg-[#b21807] shadow-[0_6px_12px_rgba(178,24,7,0.3)] transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(${activeIndex * 100}%)` }}
                />
                {ORDER_TYPES.map((optionKey) => {
                  const isActive = optionKey === selection;
                  const label = orderCopy.options[optionKey];
                  return (
                    <button
                      key={optionKey}
                      type="button"
                      onClick={() => handleSelectionChange(optionKey)}
                      className={`relative z-10 flex-1 min-w-[148px] px-6 py-2.5 text-center text-base font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        isActive
                          ? "text-white focus-visible:outline-[#b21807]"
                          : "text-[#5a5a5a] hover:text-[#2e2e2e] focus-visible:outline-[#9f9f9f]"
                      }`}
                      aria-pressed={isActive}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
