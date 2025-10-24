"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

interface Category {
  category_id: string;
  name: string;
  image_url?: string;
  is_active: boolean;
}

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (categoryData: {
    name: string;
    image_url: string;
    is_active: boolean;
  }) => void;
  isLoading?: boolean;
}

export default function EditCategoryModal({
  open,
  onClose,
  category,
  onSave,
  isLoading = false,
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    image_url: category?.image_url || "",
    is_active: category?.is_active ?? true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        image_url: category.image_url || "",
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: "",
        image_url: "",
        is_active: true,
      });
    }
  }, [category]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-neutral-200/70 md:p-10"
          >
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/60">
              <h2 className="text-2xl font-black text-neutral-900">
                {category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อหมวดหมู่
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รูปภาพ URL
                  </label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    เปิดใช้งานหมวดหมู่นี้
                  </span>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={isLoading}
                    className="rounded-full px-8 py-2.5 text-sm font-semibold text-white bg-[#b21807] hover:bg-[#8e1005] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        กำลังบันทึก...
                      </>
                    ) : (
                      "บันทึก"
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
