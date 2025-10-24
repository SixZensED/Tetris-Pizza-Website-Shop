"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/app/types/products";

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: Product;
}

const QuantityModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
}: QuantityModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
            initial={{ y: 20, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
          >
            <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
            <p className="mt-2 text-gray-600">เลือกจำนวนที่ต้องการ</p>

            <div className="flex items-center justify-center gap-4 my-8">
              <button
                onClick={decrement}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-2xl font-bold text-red-600 hover:bg-red-200 transition-colors"
              >
                -
              </button>
              <span className="text-3xl font-bold w-16 text-center text-gray-900">
                {quantity}
              </span>
              <button
                onClick={increment}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-2xl font-bold text-red-600 hover:bg-red-200 transition-colors"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-[#b21807] text-white py-3 rounded-lg font-semibold hover:bg-[#9a1506] transition-colors"
              >
                เพิ่มลงตะกร้า - ฿
                {(product.price * quantity).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </button>
              <button
                onClick={onClose}
                className="w-full bg-transparent text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                ยกเลิก
              </button>{" "}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuantityModal;
