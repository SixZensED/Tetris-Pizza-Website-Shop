"use client";

import { useState, useEffect } from "react";
import OptionModal from "./OptionModal";
import ConfirmModal from "../../components/modals/confirm/confirm-modal"; // Assuming reusable confirm modal

// Define the structure for a single product option
export interface ProductOption {
  option_id: number;
  category_id: number;
  option_type: string;
  option_name: string;
  additional_price: number;
  is_available: boolean;
}

const OptionsPage = () => {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(
    null,
  );

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  const fetchOptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/api/options`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดตัวเลือกได้");
      }
      const data = await response.json();
      // Normalize additional_price to ensure it's a number
      const normalizedOptions = (Array.isArray(data) ? data : []).map(
        (option) => ({
          ...option,
          additional_price:
            typeof option.additional_price === "string"
              ? parseFloat(option.additional_price)
              : option.additional_price || 0,
        }),
      );
      setOptions(normalizedOptions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleOpenAddModal = () => {
    setEditingOption(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (option: ProductOption) => {
    setEditingOption(option);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (id: number) => {
    setDeletingOptionId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveOption = async (
    optionData: Omit<ProductOption, "option_id"> & { option_id?: number },
  ) => {
    // This now needs to be connected to the real API
    const method = editingOption ? "PUT" : "POST";
    const url = editingOption
      ? `${apiBaseUrl}/api/options/${editingOption.option_id}`
      : `${apiBaseUrl}/api/options`;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(optionData),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "ไม่สามารถบันทึกตัวเลือกได้");
      }

      setIsModalOpen(false);
      setEditingOption(null);
      await fetchOptions(); // Re-fetch to show updated data
    } catch (err: any) {
      console.error("Save option error:", err);
      // TODO: Show error to user in the modal
    }
  };

  const handleDeleteOption = async () => {
    if (!deletingOptionId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/options/${deletingOptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "ไม่สามารถลบตัวเลือกได้");
      }

      setIsDeleteConfirmOpen(false);
      setDeletingOptionId(null);
      await fetchOptions(); // Re-fetch to show updated data
    } catch (err: any) {
      console.error("Delete option error:", err);
      // TODO: Show error to user
    }
  };

  return (
    <>
      <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการตัวเลือกหมวดหมู่
          </h1>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#b21807] hover:bg-[#9a1506] text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + เพิ่มตัวเลือกใหม่
          </button>
        </div>

        {isLoading && <p>กำลังโหลดตัวเลือก...</p>}
        {error && <p className="text-red-500">ข้อผิดพลาด: {error}</p>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัส
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัสหมวดหมู่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคาเพิ่มเติม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    พร้อมใช้งาน
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {options.map((option) => (
                  <tr key={option.option_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {option.option_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {option.category_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {option.option_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {option.option_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ฿
                      {(typeof option.additional_price === "number"
                        ? option.additional_price
                        : parseFloat(option.additional_price) || 0
                      ).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {option.is_available ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ใช่
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          ไม่
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(option)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() =>
                          handleOpenDeleteConfirm(option.option_id)
                        }
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <OptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOption(null);
        }}
        onSave={handleSaveOption}
        option={editingOption}
      />
      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="ยืนยันการลบ"
        subtitle={`คุณแน่ใจหรือไม่ว่าต้องการลบตัวเลือกนี้? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        onConfirm={handleDeleteOption}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
};

export default OptionsPage;
