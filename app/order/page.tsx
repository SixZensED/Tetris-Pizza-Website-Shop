"use client";
import { Suspense, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { TopBar } from "../components/layout/topbar";
import { OrderTypeSection } from "../components/sections/order-type-section";
import { FoodCategoriesSection } from "../components/sections/food-categories-section";
import SortDropdown from "../components/common/SortDropdown";

const MenuList = dynamic(() => import("../components/menu/MenuList"), { ssr: false });

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M22 18.605a.75.75 0 0 1-.75.75h-5.1a2.93 2.93 0 0 1-5.66 0H2.75a.75.75 0 1 1 0-1.5h7.74a2.93 2.93 0 0 1 5.66 0h5.1a.75.75 0 0 1 .75.75m0-13.21a.75.75 0 0 1-.75.75H18.8a2.93 2.93 0 0 1-5.66 0H2.75a.75.75 0 1 1 0-1.5h10.39a2.93 2.93 0 0 1 5.66 0h2.45a.74.74 0 0 1 .75.75m0 6.6a.74.74 0 0 1-.75.75H9.55a2.93 2.93 0 0 1-5.66 0H2.75a.75.75 0 1 1 0-1.5h1.14a2.93 2.93 0 0 1 5.66 0h11.7a.75.75 0 0 1 .75.75"
    />
  </svg>
);

const SORT_OPTIONS = [
  { value: "default", label: "เรียงตามลำดับ" },
  { value: "price-desc", label: "ราคาสูงไปต่ำ" },
  { value: "price-asc", label: "ราคาต่ำไปสูง" },
];

function OrderPageContent() {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("category_id") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <main className="flex-1 w-full pt-4 pb-16">
        <OrderTypeSection />
        <FoodCategoriesSection activeCategory={selectedCategoryId} />
        <div className="mt-8 max-w-[1440px] mx-auto px-6">
          <div className="mb-8 flex items-center justify-end gap-4">
            <input
              type="text"
              placeholder="ค้นหาเมนู..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-500"
            />
            <SortDropdown
              options={SORT_OPTIONS}
              value={sortOption}
              onChange={setSortOption}
              icon={<FilterIcon />}
            />
          </div>
          <MenuList
            categoryId={selectedCategoryId}
            searchQuery={searchQuery}
            sortOption={sortOption}
          />
        </div>
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b21807]"></div>
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}