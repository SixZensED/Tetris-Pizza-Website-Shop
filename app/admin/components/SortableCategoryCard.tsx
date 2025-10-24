"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
  category_id: string;
  name: string;
  image_url?: string;
  is_active: boolean;
  position: number;
}

interface SortableCategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function SortableCategoryCard({
  category,
  onEdit,
  onDelete,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.category_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : category.is_active ? 1 : 0.6,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition"
    >
      {!category.is_active && (
        <div className="absolute top-3 right-3 bg-gray-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ไม่ใช้งาน
        </div>
      )}
      <div {...listeners} className="cursor-grab touch-none flex-grow">
        {category.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-32 object-cover rounded-lg mb-4 pointer-events-none"
          />
        )}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3
              className={`text-lg font-semibold ${category.is_active ? "text-gray-800" : "text-gray-500"}`}
            >
              {category.name}
            </h3>
            <span className="text-xs text-gray-500">
              ID: {category.category_id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(category)}
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
          onClick={() => onDelete(category)}
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
  );
}
