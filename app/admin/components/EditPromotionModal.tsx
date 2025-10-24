"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

// Updated Promotion interface
interface Promotion {
  promotion_id: string;
  name: string; // Keep for display, but will be same as coupon_code
  description?: string;
  image_url?: string;
  is_active: boolean;
  coupon_code: string;
  discount_type: "Percentage" | "Fixed Amount";
  discount_value: number;
  min_purchase: number;
  start_date: string;
  expiry_date: string;
}

// Form data will not have a separate name field
interface PromotionFormData {
  description?: string;
  image_url?: string;
  is_active: boolean;
  coupon_code: string;
  discount_type: "Percentage" | "Fixed Amount";
  discount_value: number;
  min_purchase: number;
  start_date: string;
  expiry_date: string;
}

interface EditPromotionModalProps {
  open: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onSave: (data: PromotionFormData & { name: string }) => void; // onSave will add the name
  isLoading?: boolean;
}

const toDateTimeLocal = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

export default function EditPromotionModal({
  open,
  onClose,
  promotion,
  onSave,
  isLoading = false,
}: EditPromotionModalProps) {
  const [formData, setFormData] = useState<PromotionFormData>({
    description: "",
    image_url: "",
    is_active: true,
    coupon_code: "",
    discount_type: "Fixed Amount",
    discount_value: 0,
    min_purchase: 0,
    start_date: toDateTimeLocal(new Date().toISOString()),
    expiry_date: toDateTimeLocal(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ),
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        description: promotion.description || "",
        image_url: promotion.image_url || "",
        is_active: promotion.is_active,
        coupon_code: promotion.coupon_code,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        min_purchase: promotion.min_purchase,
        start_date: toDateTimeLocal(promotion.start_date),
        expiry_date: toDateTimeLocal(promotion.expiry_date),
      });
    } else {
      setFormData({
        description: "",
        image_url: "",
        is_active: true,
        coupon_code: "",
        discount_type: "Fixed Amount",
        discount_value: 0,
        min_purchase: 0,
        start_date: toDateTimeLocal(new Date().toISOString()),
        expiry_date: toDateTimeLocal(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ),
      });
    }
  }, [promotion]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const isNumber = type === "number";
    setFormData((prev) => ({
      ...prev,
      [name]: isNumber ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      name: formData.coupon_code, // Use coupon_code as the name
      start_date: new Date(formData.start_date).toISOString(),
      expiry_date: new Date(formData.expiry_date).toISOString(),
    };
    onSave(dataToSave);
  };

  const inputClasses =
    "w-full rounded-lg border border-neutral-300 px-4 py-2 text-base text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 outline-none";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl border border-neutral-200/70 md:p-10"
          >
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/60">
              <h2 className="text-2xl font-black text-neutral-900">
                {promotion ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50"
              >
                <FiX size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    โค้ดคูปอง / ชื่อโปรโมชั่น
                  </label>
                  <input
                    type="text"
                    name="coupon_code"
                    value={formData.coupon_code}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภทส่วนลด
                  </label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    className={inputClasses}
                  >
                    <option value="Fixed Amount">จำนวนเงินคงที่</option>
                    <option value="Percentage">เปอร์เซ็นต์</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    มูลค่าส่วนลด
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ยอดซื้อขั้นต่ำ
                  </label>
                  <input
                    type="number"
                    name="min_purchase"
                    value={formData.min_purchase}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย (ไม่จำเป็น)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รูปภาพ URL (ไม่จำเป็น)
                  </label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเริ่มต้น
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันหมดอายุ
                  </label>
                  <input
                    type="datetime-local"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center pt-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-yellow-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  เปิดใช้งานโปรโมชั่นนี้
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
                  {isLoading ? "กำลังบันทึก..." : "บันทึก"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
