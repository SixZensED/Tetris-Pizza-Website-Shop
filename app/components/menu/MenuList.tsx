"use client";

import React, { useState, useEffect } from "react";
import { Product, Category } from "@/app/types/products";
import { motion } from "framer-motion";
import ProductCard from "../common/ProductCard";

interface CategoryWithProducts extends Category {
  products: Product[];
}

const MenuList = ({
  categoryId,
  searchQuery,
  sortOption,
}: {
  categoryId: string;
  searchQuery: string;
  sortOption: string;
}) => {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch categories
        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/categories`),
          fetch(`${apiBaseUrl}/api/products`),
        ]);

        if (!categoriesRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [categoriesData, productsData] = await Promise.all([
          categoriesRes.json(),
          productsRes.json(),
        ]);

        // Normalize products data
        const normalizedProducts = (
          Array.isArray(productsData) ? productsData : []
        ).map((p: any) => ({
          ...p,
          price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
        }));

        // Group products by category
        const categoriesWithProducts = (
          Array.isArray(categoriesData) ? categoriesData : []
        )
          .map((category: Category) => {
            const categoryProducts = normalizedProducts.filter(
              (p: Product) =>
                p.category_id?.toString() === category.category_id?.toString(),
            );
            return {
              ...category,
              products: categoryProducts,
            };
          })
          .filter((cat: CategoryWithProducts) => cat.products.length > 0);

        setCategories(categoriesWithProducts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  // Filter categories based on categoryId and search query
  const filteredCategories = categories
    .filter((category) =>
      categoryId ? category.category_id?.toString() === categoryId : true,
    )
    .map((category) => {
      const filteredProducts = category.products.filter((product) =>
        searchQuery
          ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      );

      // Sort products if needed
      const sortedProducts = [...filteredProducts];
      if (sortOption === "price-desc") {
        sortedProducts.sort((a, b) => b.price - a.price);
      } else if (sortOption === "price-asc") {
        sortedProducts.sort((a, b) => a.price - b.price);
      }

      return {
        ...category,
        products: sortedProducts,
      };
    })
    .filter((category) => category.products.length > 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        ไม่พบสินค้าที่คุณค้นหา
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {filteredCategories.map((category, categoryIndex) => (
        <div key={category.category_id || categoryIndex} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((product, productIndex) => (
              <motion.div
                key={product.product_id}
                custom={productIndex}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList;
