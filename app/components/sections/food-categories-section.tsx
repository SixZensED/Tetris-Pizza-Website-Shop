import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const SECTION_MAX_WIDTH = "max-w-[1440px]";

interface Category {
  category_id: string;
  name: string;
  image_url?: string;
  is_active: boolean;
  position: number;
}

export function FoodCategoriesSection({
  activeCategory,
}: {
  activeCategory?: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);

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

  return (
    <section className="mt-12">
      <div className={`mx-auto w-full ${SECTION_MAX_WIDTH} px-6`}>
        <header className="flex items-center gap-3">
          <FoodCategoriesIcon className="h-8 w-8 text-[#b21807]" />
          <h2 className="text-lg font-bold tracking-tight text-[#515151]">
            หมวดหมู่อาหาร
          </h2>
        </header>
        <div className="mt-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-nowrap gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.category_id}
                label={category.name}
                imageUrl={category.image_url}
                href={`/order?category_id=${category.category_id}`}
                isActive={activeCategory === category.category_id}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type CategoryCardProps = {
  label: string;
  href: string;
  imageUrl?: string;
  isActive?: boolean;
};

function CategoryCard({ label, href, imageUrl, isActive }: CategoryCardProps) {
  // Create a URL object to handle the href
  const url = new URL(href, "http://localhost:3000");
  const cleanHref = `${url.pathname}${url.search}`;

  const activeClasses = isActive
    ? "border-[#b21807] -translate-y-1 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
    : "border-[#e5e5e5]";

  return (
    <Link
      href={cleanHref}
      as={cleanHref}
      className={`flex aspect-square w-[160px] flex-col rounded-[18px] border bg-white px-4 py-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b21807] md:w-[180px] ${activeClasses}`}
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
              unoptimized={imageUrl.startsWith('http')} // Disable optimization for external images
              onError={(e) => {
                // Fallback to a text label if image fails to load
                const container = (e.target as HTMLElement).parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center p-2">
                      ${label}
                    </div>
                  `;
                }
              }}
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
}

function FoodCategoriesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M4.505 2h-.013a.5.5 0 0 0-.176.036a.5.5 0 0 0-.31.388C3.99 2.518 3.5 5.595 3.5 7c0 .95.442 1.797 1.13 2.345c.25.201.37.419.37.601v.5q0 .027-.003.054c-.027.26-.151 1.429-.268 2.631C4.614 14.316 4.5 15.581 4.5 16a2 2 0 1 0 4 0c0-.42-.114-1.684-.229-2.869a302 302 0 0 0-.268-2.63L8 10.446v-.5c0-.183.12-.4.37-.601A3 3 0 0 0 9.5 7c0-1.408-.493-4.499-.506-4.577a.5.5 0 0 0-.355-.403A.5.5 0 0 0 8.51 2h-.02h.001a.505.505 0 0 0-.501.505v4a.495.495 0 0 1-.99.021V2.5a.5.5 0 0 0-1 0v4l.001.032a.495.495 0 0 1-.99-.027V2.506A.506.506 0 0 0 4.506 2M11 6.5A4.5 4.5 0 0 1 15.5 2a.5.5 0 0 1 .5.5v6.978l.02.224a626 626 0 0 1 .228 2.696c.124 1.507.252 3.161.252 3.602a2 2 0 1 1-4 0c0-.44.128-2.095.252-3.602c.062-.761.125-1.497.172-2.042l.03-.356H12.5A1.5 1.5 0 0 1 11 8.5zM8.495 2h-.004z"
        fill="currentColor"
      />
    </svg>
  );
}
