"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductOption } from "./page";
import { FiX } from "react-icons/fi";

interface Category {
  category_id: number;
  name: string;
}

interface OptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (option: Omit<ProductOption, "option_id">) => void;
  option?: ProductOption | null;
}

// Custom Dropdown Component
const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "เลือกรายการ",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="w-full bg-white border border-neutral-300 rounded px-3 py-2.5 text-left text-[14px] text-neutral-800 flex justify-between items-center focus:outline-none focus:border-neutral-400"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span
          className={selectedOption ? "text-neutral-800" : "text-neutral-500"}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-neutral-400 ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded shadow-sm max-h-64 overflow-y-auto"
          >
            <ul className="py-0">
              <li
                className="px-3 py-2 text-neutral-400 hover:bg-neutral-50 cursor-pointer text-[14px]"
                onClick={() => handleSelect("")}
              >
                {placeholder}
              </li>
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 hover:bg-neutral-50 cursor-pointer text-[14px] ${
                    value === option.value
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-700"
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OptionModal = ({ isOpen, onClose, onSave, option }: OptionModalProps) => {
  const [formData, setFormData] = useState({
    category_id: "",
    option_type: "",
    option_name: "",
    additional_price: "",
    is_available: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Set form data when option changes
  useEffect(() => {
    if (option) {
      setFormData({
        category_id: String(option.category_id),
        option_type: option.option_type,
        option_name: option.option_name,
        additional_price: String(option.additional_price),
        is_available: option.is_available,
      });
    } else {
      // Reset for new entry
      setFormData({
        category_id: "",
        option_type: "",
        option_name: "",
        additional_price: "",
        is_available: true,
      });
    }
  }, [option, isOpen]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      category_id: Number(formData.category_id),
      additional_price: Number(formData.additional_price),
    });
  };

  // Common option types for pizza
  const optionTypes = [
    { value: "size", label: "ขนาด" },
    { value: "crust", label: "ขอบพิซซ่า" },
    { value: "topping", label: "ท็อปปิ้งพิเศษ" },
    { value: "sauce", label: "ซอส" },
    { value: "cheese", label: "ชีส" },
    { value: "other", label: "อื่นๆ" },
  ];

  const categoryOptions = categories.map((category) => ({
    value: String(category.category_id),
    label: category.name,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-neutral-200/70 md:p-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/60">
              <h2 className="text-2xl font-black text-neutral-900">
                {option ? "แก้ไขตัวเลือก" : "เพิ่มตัวเลือกใหม่"}
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เลือกหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={categoryOptions}
                  value={formData.category_id}
                  onChange={(value) =>
                    handleDropdownChange("category_id", value)
                  }
                  placeholder={
                    isLoadingCategories ? "กำลังโหลด..." : "-- เลือกหมวดหมู่ --"
                  }
                  disabled={isLoadingCategories}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทตัวเลือก <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={optionTypes}
                  value={formData.option_type}
                  onChange={(value) =>
                    handleDropdownChange("option_type", value)
                  }
                  placeholder="-- เลือกประเภท --"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อตัวเลือก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="option_name"
                  value={formData.option_name}
                  onChange={handleChange}
                  placeholder="เช่น ขนาด L, ขอบชีส, เพิ่มเบคอน"
                  className="w-full rounded border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาเพิ่มเติม (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="additional_price"
                  step="0.01"
                  value={formData.additional_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#b21807] focus:ring-[#b21807]"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  พร้อมใช้งาน
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition"
                >
                  ยกเลิก
                </button>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full px-8 py-2.5 text-sm font-semibold text-white bg-[#b21807] hover:bg-[#8e1005] transition-all flex items-center justify-center gap-2"
                >
                  บันทึกตัวเลือก
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OptionModal;
