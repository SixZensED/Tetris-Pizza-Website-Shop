"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import SuccessModal from "../../components/modals/success/success-modal";
import ConfirmModal from "../../components/modals/confirm/confirm-modal";
import ErrorModal from "../../components/modals/error/error-modal";
import EditCategoryModal from "../components/EditCategoryModal";
import SortableCategoryCard from "../components/SortableCategoryCard";

interface Category {
  category_id: string;
  name: string;
  image_url?: string;
  is_active: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & form states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    subtitle: "",
    primaryText: "",
    primaryHref: "",
    onClose: () => setSuccessModal((prev) => ({ ...prev, open: false })),
  });
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    subtitle: "",
    onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
  });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const refreshCategory = async () => {
    await fetchCategories();
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiBaseUrl}/api/categories`);

      if (!response.ok) throw new Error("Unable to fetch categories.");

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

      const normalised: Category[] = rawItems
        .map((item: any) => ({
          category_id: String(item.category_id),
          name: String(item.name),
          image_url: item.image_url || "",
          is_active: Boolean(item.is_active),
          position: Number(item.position),
          createdAt: item.createdAt || "",
          updatedAt: item.updatedAt || "",
        }))
        .sort((a, b) => a.position - b.position);

      setCategories(normalised);
    } catch (err: any) {
      setCategories([]);
      setError(err?.message ?? "Unexpected error fetching categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorModal({
          open: true,
          title: "เกิดข้อผิดพลาด",
          subtitle: "กรุณาเข้าสู่ระบบก่อนดำเนินการ",
          onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${categoryToDelete.category_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("ไม่สามารถลบหมวดหมู่ได้");

      setSuccessModal({
        open: true,
        title: "สำเร็จ",
        subtitle: "ลบหมวดหมู่เรียบร้อยแล้ว",
        primaryText: "ตกลง",
        primaryHref: "#",
        onClose: () => {
          setSuccessModal((prev) => ({ ...prev, open: false }));
          refreshCategory();
        },
      });
    } catch (err: any) {
      setErrorModal({
        open: true,
        title: "เกิดข้อผิดพลาด",
        subtitle: err.message || "เกิดข้อผิดพลาดในการลบหมวดหมู่",
        onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
      });
    } finally {
      setCategoryToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveCategory = async (formData: {
    name: string;
    image_url: string;
    is_active: boolean;
  }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorModal({
        open: true,
        title: "เกิดข้อผิดพลาด",
        subtitle: "กรุณาเข้าสู่ระบบก่อนดำเนินการ",
        onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
      });
      return;
    }

    if (!formData.name.trim()) {
      setErrorModal({
        open: true,
        title: "เกิดข้อผิดพลาด",
        subtitle: "กรุณากรอกชื่อหมวดหมู่",
        onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
      });
      return;
    }

    try {
      const url = currentCategory
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${currentCategory.category_id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`;
      const method = currentCategory ? "PUT" : "POST";

      const requestBody: any = {
        name: formData.name.trim(),
        image_url: formData.image_url,
        is_active: formData.is_active,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const responseData = await response.json();

      if (!response.ok) {
        const errorData = responseData;
        if (
          errorData.code === "23505" ||
          errorData.constraint === "categories_name_key"
        ) {
          setErrorModal({
            open: true,
            title: "เกิดข้อผิดพลาด",
            subtitle: `มีหมวดหมู่ชื่อ "${formData.name}" อยู่ในระบบแล้ว`,
            onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
          });
          return;
        }
        setErrorModal({
          open: true,
          title: "เกิดข้อผิดพลาด",
          subtitle:
            errorData.message ||
            errorData.detail ||
            "เกิดข้อผิดพลาดในการบันทึกข้อมูลหมวดหมู่",
          onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
        });
        return;
      }

      setSuccessModal({
        open: true,
        title: "สำเร็จ",
        subtitle: currentCategory
          ? "อัปเดตหมวดหมู่เรียบร้อยแล้ว"
          : `เพิ่มหมวดหมู่ "${responseData.name}" เรียบร้อยแล้ว`,
        primaryText: "ตกลง",
        primaryHref: "#",
        onClose: () => {
          setSuccessModal((prev) => ({ ...prev, open: false }));
          setIsEditModalOpen(false);
          refreshCategory();
        },
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      setErrorModal({
        open: true,
        title: "เกิดข้อผิดพลาด",
        subtitle: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
      });
    }
  };

  const updateCategoryOrder = async (orderedIds: string[]) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderedIds }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reorder categories");
      }
    } catch (error) {
      console.error("Error reordering categories:", error);
      setErrorModal({
        open: true,
        title: "เกิดข้อผิดพลาด",
        subtitle: "ไม่สามารถจัดลำดับหมวดหมู่ได้",
        onClose: () => setErrorModal((prev) => ({ ...prev, open: false })),
      });
      // Optionally re-fetch to revert optimistic update
      fetchCategories();
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(
          (item) => item.category_id === active.id,
        );
        const newIndex = items.findIndex(
          (item) => item.category_id === over.id,
        );
        const newItems = arrayMove(items, oldIndex, newIndex);

        // After reordering, call API to update positions
        const orderedIds = newItems.map((item) => item.category_id);
        updateCategoryOrder(orderedIds);

        return newItems;
      });
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          จัดการหมวดหมู่สินค้า
        </h1>
        <button
          onClick={() => {
            setCurrentCategory(null);
            setIsEditModalOpen(true);
          }}
          className="bg-[#b21807] hover:bg-[#9a1506] text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="ค้นหาหมวดหมู่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-300 rounded-full placeholder-gray-700 text-gray-900"
        />
        <div className="absolute top-0 left-0 inline-flex items-center justify-center w-10 h-full text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <SortableContext
            items={filteredCategories.map((c) => c.category_id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => (
                <SortableCategoryCard
                  key={cat.category_id}
                  category={cat}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <EditCategoryModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={currentCategory}
        onSave={handleSaveCategory}
        isLoading={isLoading}
      />
      <SuccessModal
        open={successModal.open}
        title={successModal.title}
        subtitle={successModal.subtitle}
        primaryText={successModal.primaryText}
        primaryHref={successModal.primaryHref}
        onClose={successModal.onClose}
      />
      <ErrorModal
        open={errorModal.open}
        title={errorModal.title}
        subtitle={errorModal.subtitle}
        onClose={errorModal.onClose}
      />
      <ConfirmModal
        open={showDeleteConfirm}
        title="ยืนยันการลบ"
        subtitle={`คุณแน่ใจหรือไม่ว่าต้องการลบ "${categoryToDelete?.name}" ?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
