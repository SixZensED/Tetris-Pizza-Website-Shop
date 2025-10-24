"use client";

import { useState } from "react";
import { Product } from "@/app/types/products";
import SuccessModal from "../modals/success/success-modal";
import ProductCustomizationModal from "../menu/ProductCustomizationModal";

const ProductCard = ({ product }: { product: Product }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] =
    useState(false);

  // A simple heuristic to determine if a product is customizable (e.g., is a pizza)
  // In a real app, this would likely be a boolean flag on the product object itself.
  const isCustomizable = product.category_name?.toLowerCase() === "pizza";

  const handleModalClose = (wasSuccessful: boolean) => {
    setIsCustomizationModalOpen(false);
    if (wasSuccessful) {
      setShowSuccessModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
        <div className="relative">
          <img
            src={product.image_url || "/images/placeholder.png"}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {!product.is_available && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              หมด
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-600 h-10 overflow-hidden mt-1">
            {product.description}
          </p>
          <div className="mt-auto flex justify-between items-center pt-4">
            <p className="text-lg font-semibold text-gray-900">
              ฿
              {product.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <button
              onClick={() => setIsCustomizationModalOpen(true)} // Always open customization for now
              disabled={!product.is_available}
              className="bg-[#b21807] hover:bg-[#9a1506] text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </div>

      {isCustomizationModalOpen && (
        <ProductCustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={handleModalClose}
          product={product}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          open={showSuccessModal}
          title="สำเร็จ"
          subtitle={`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`}
          onClose={() => setShowSuccessModal(false)}
          primaryText="ตกลง"
          onPrimaryAction={() => window.location.reload()} // As per previous user request
        />
      )}
    </>
  );
};

export default ProductCard;
