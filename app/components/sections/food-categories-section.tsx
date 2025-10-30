import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguageContext } from "@/app/contexts/language-context";
import { getFoodCategoriesCopy } from "@/app/lib/translations";

// Icons
const FoodCategoriesIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className}>
    <path d="M4.505 2h-.013a.5.5 0 0 0-.176.036a.5.5 0 0 0-.31.388C3.99 2.518 3.5 5.595 3.5 7c0 .95.442 1.797 1.13 2.345c.25.201.37.419.37.601v.5q0 .027-.003.054c-.027.26-.151 1.429-.268 2.631C4.614 14.316 4.5 15.581 4.5 16a2 2 0 1 0 4 0c0-.42-.114-1.684-.229-2.869a302 302 0 0 0-.268-2.63L8 10.446v-.5c0-.183.12-.4.37-.601A3 3 0 0 0 9.5 7c0-1.408-.493-4.499-.506-4.577a.5.5 0 0 0-.355-.403A.5.5 0 0 0 8.51 2h-.02h.001a.505.505 0 0 0-.501.505v4a.495.495 0 0 1-.99.021V2.5a.5.5 0 0 0-1 0v4l.001.032a.495.495 0 0 1-.99-.027V2.506A.506.506 0 0 0 4.506 2M11 6.5A4.5 4.5 0 0 1 15.5 2a.5.5 0 0 1 .5.5v6.978l.02.224a626 626 0 0 1 .228 2.696c.124 1.507.252 3.161.252 3.602a2 2 0 1 1-4 0c0-.44.128-2.095.252-3.602c.062-.761.125-1.497.172-2.042l.03-.356H12.5A1.5 1.5 0 0 1 11 8.5z" fill="currentColor" />
  </svg>
);

const ChevronLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

// Category Card Component
const CategoryCard = ({ 
  label, 
  href, 
  imageUrl
}: {
  label: string;
  href: string;
  imageUrl?: string;
}) => {
  return (
    <Link
      href={href}
      className="flex aspect-square w-[160px] flex-col rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b21807] md:w-[180px]"
    >
      <span className="text-base font-semibold text-[#b21807]">{label}</span>
      <span className="flex flex-1 items-center justify-center">
        {imageUrl ? (
          <div className="relative h-[96px] w-[96px]">
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-contain"
              unoptimized={imageUrl.startsWith('http')}
            />
          </div>
        ) : (
          <div className="h-[96px] w-[96px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center p-2">
            {label}
          </div>
        )}
      </span>
    </Link>
  );
};

// Constants
const SECTION_MAX_WIDTH = "max-w-[1440px]";

// Types
interface Category {
  category_id: string;
  name: string;
  image_url?: string;
  is_active: boolean;
  position: number;
}

type FoodCategoryKey = keyof ReturnType<typeof getFoodCategoriesCopy>['items'];

export function FoodCategoriesSection({
  activeCategory,
}: {
  activeCategory?: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { language } = useLanguageContext();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${apiBaseUrl}/api/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const payload = await response.json();
        const rawItems = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.categories)
            ? payload.categories
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.results)
                  ? payload.results
                  : [];

        const activeCategories = rawItems
          .filter((cat: Category) => cat.is_active)
          .sort((a: Category, b: Category) => a.position - b.position);

        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 300; // Adjust this value to control scroll distance
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Add 'All Categories' as the first category
  const allCategoriesItem: Category = {
    category_id: 'all',
    name: 'ทั้งหมด',
    is_active: true,
    position: -1, // To ensure it appears first
    image_url: '/images/all-categories.png' // Default image for 'All' category
  };

  // Combine 'All' with other categories
  const categoriesWithAll = [allCategoriesItem, ...categories];

  return (
    <section className="mt-12 relative">
      <div className={`mx-auto w-full ${SECTION_MAX_WIDTH} px-6`}>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FoodCategoriesIcon className="h-8 w-8 text-[#b21807]" />
            <h2 className="text-lg font-bold tracking-tight text-[#515151]">
              {getFoodCategoriesCopy(language).heading}
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#b21807] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#b21807] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="relative mt-6">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex flex-nowrap gap-4">
              {categoriesWithAll.map((category) => {
              const label = category.category_id === 'all' 
                ? 'เมนูทั้งหมด' 
                : getFoodCategoriesCopy(language).items[category.name.toLowerCase() as keyof ReturnType<typeof getFoodCategoriesCopy>['items']] || category.name;
              
              const href = category.category_id === 'all'
                ? '/order'  // No category filter for 'All'
                : `/order?category_id=${category.category_id}`;
              
              // Fallback to label if image_url is not provided
              const imageUrl = category.image_url || `https://via.placeholder.com/96?text=${encodeURIComponent(label)}`;

              return (
                <CategoryCard
                  key={category.category_id}
                  label={label}
                  imageUrl={imageUrl}
                  href={href}
                />
              );
            })}
            </div>
          </div>
          
          {/* Mobile navigation buttons */}
          <div className="md:hidden flex justify-center gap-4 mt-4">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#b21807] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#b21807] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}