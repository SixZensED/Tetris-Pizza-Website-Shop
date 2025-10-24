"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/app/types/products";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import SuccessModal from "../../components/modals/success/success-modal";
import ConfirmModal from "../../components/modals/confirm/confirm-modal";

// Define Category type locally for this component
interface Category {
  category_id: string;
  name: string;
}

// --- Modal Components ---
const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  categories,
  product,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_available: true,
    category_id: categories[0]?.category_id || "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image_url: product.image_url || "",
        is_available: product.is_available,
        category_id: product.category_id.toString(),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        image_url: "",
        is_available: true,
        category_id: categories[0]?.category_id || "",
      });
    }
  }, [product, isOpen, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id, 10),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-neutral-200/70 md:p-10"
          >
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/60">
              <h2 className="text-2xl font-black text-neutral-900">
                {product ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคา
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm"
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
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">พร้อมจำหน่าย</span>
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
                  className="rounded-full px-8 py-2.5 text-sm font-semibold text-white bg-[#b21807] hover:bg-[#8e1005] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
};

const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
      <p className="text-sm text-gray-600 h-10 overflow-hidden">
        {product.description}
      </p>
      <p className="text-sm text-gray-500 mt-2">{product.category_name}</p>
      <div className="flex justify-between items-center mt-4">
        <p className="text-lg font-semibold text-gray-900">
          ฿{product.price.toFixed(2)}
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onEdit(product)}
            className="flex items-center text-sm text-gray-600 hover:text-yellow-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
              />
            </svg>
            แก้ไข
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex items-center text-sm text-[#b21807] hover:text-[#9a1506] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            ลบ
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Custom Dropdown Component ---
const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
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
    <div className="relative w-full md:w-72" ref={dropdownRef}>
      <button
        type="button"
        className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-left text-[15px] text-neutral-800 flex justify-between items-center shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
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

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 w-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg"
        >
          <ul className="py-1">
            <li
              className="px-4 py-2 text-neutral-800 hover:bg-neutral-100 cursor-pointer"
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </li>
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2 text-neutral-800 hover:bg-neutral-100 cursor-pointer ${value === option.value ? "bg-neutral-100" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default function FoodsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    subtitle: "",
  });

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/products`),
        fetch(`${apiBaseUrl}/api/categories`),
      ]);

      if (!productsResponse.ok) throw new Error("Failed to fetch products.");
      if (!categoriesResponse.ok)
        throw new Error("Failed to fetch categories.");

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      const normalizedProducts = (
        Array.isArray(productsData) ? productsData : []
      ).map((p) => ({
        ...p,
        price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
      }));

      const normalizedCategories = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData.categories || [];

      setProducts(normalizedProducts);
      setCategories(normalizedCategories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CRUD Handlers ---
  const handleAddProduct = async (formData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product.");
      }
      setAddModalOpen(false);
      setSuccessModal({
        open: true,
        title: "สำเร็จ",
        subtitle: "เพิ่มสินค้าใหม่เรียบร้อยแล้ว",
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (formData) => {
    if (!selectedProduct) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/products/${selectedProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product.");
      }
      setEditModalOpen(false);
      setSuccessModal({
        open: true,
        title: "สำเร็จ",
        subtitle: "อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว",
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/products/${selectedProduct.product_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product.");
      }
      setDeleteModalOpen(false);
      setSuccessModal({
        open: true,
        title: "สำเร็จ",
        subtitle: `ลบสินค้า "${selectedProduct?.name}" เรียบร้อยแล้ว`,
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSelectedProduct(null);
      setIsLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category_id.toString() === selectedCategoryId)
    : products;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการเมนูอาหาร</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#b21807] hover:bg-[#9a1506] text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + เพิ่มเมนูใหม่
        </button>
      </div>

      <div className="mb-8">
        <CustomDropdown
          options={categories.map((cat) => ({
            value: cat.category_id.toString(),
            label: cat.name,
          }))}
          value={selectedCategoryId}
          onChange={(value) => setSelectedCategoryId(value || "")}
          placeholder="ทุกหมวดหมู่"
        />
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={selectedProduct ? handleEditProduct : handleAddProduct}
        isLoading={isLoading}
        categories={categories}
        product={selectedProduct}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="ยืนยันการลบ"
        subtitle={`คุณแน่ใจหรือไม่ว่าต้องการลบ "${selectedProduct?.name}" ?`}
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteModalOpen(false)}
      />

      <SuccessModal
        open={successModal.open}
        title={successModal.title}
        subtitle={successModal.subtitle}
        onClose={() =>
          setSuccessModal({ open: false, title: "", subtitle: "" })
        }
        primaryText="ตกลง"
        primaryHref="#"
      />
    </div>
  );
}
