"use client";

import { useState, useEffect } from "react";
import SuccessModal from "../../components/modals/success/success-modal";
import ConfirmModal from "../../components/modals/confirm/confirm-modal";
import ErrorModal from "../../components/modals/error/error-modal";
import EditPromotionModal from "../components/EditPromotionModal";

interface Promotion {
  promotion_id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  coupon_code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_purchase: number;
  start_date: string;
  expiry_date: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successModal, setSuccessModal] = useState({
    open: false,
    subtitle: "",
  });
  const [errorModal, setErrorModal] = useState({ open: false, subtitle: "" });

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiBaseUrl}/api/promotions`);
      if (!response.ok) throw new Error("Failed to fetch promotions");
      const data = await response.json();
      const items = data.promotions || data.data || data;
      setPromotions(
        Array.isArray(items)
          ? items.sort(
              (a, b) =>
                new Date(b.start_date).getTime() -
                new Date(a.start_date).getTime(),
            )
          : [],
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleAddNewClick = () => {
    setCurrentPromotion(null);
    setIsEditModalOpen(true);
  };

  const handleEditClick = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setShowDeleteConfirm(true);
  };

  const handleSavePromotion = async (
    formData: Omit<Promotion, "promotion_id">,
  ) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const method = currentPromotion ? "PUT" : "POST";
    const url = currentPromotion
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/${currentPromotion.promotion_id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save promotion");
      }

      setIsEditModalOpen(false);
      setSuccessModal({
        open: true,
        subtitle: `โปรโมชั่น "${formData.name}" ถูกบันทึกเรียบร้อยแล้ว`,
      });
      fetchPromotions();
    } catch (err: any) {
      setErrorModal({ open: true, subtitle: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/${promotionToDelete.promotion_id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete promotion");
      }

      setShowDeleteConfirm(false);
      setSuccessModal({ open: true, subtitle: "ลบโปรโมชั่นเรียบร้อยแล้ว" });
      fetchPromotions();
    } catch (err: any) {
      setErrorModal({ open: true, subtitle: err.message });
    } finally {
      setIsLoading(false);
      setPromotionToDelete(null);
    }
  };

  const filteredPromotions = promotions.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description &&
        p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.coupon_code &&
        p.coupon_code.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการโปรโมชั่น</h1>
        <button
          onClick={handleAddNewClick}
          className="bg-[#b21807] hover:bg-[#9a1506] text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + เพิ่มโปรโมชั่นใหม่
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="ค้นหาชื่อ, คำอธิบาย, หรือโค้ดโปรโมชั่น..."
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

      {isLoading && !isEditModalOpen && !showDeleteConfirm ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : (
        <>
          {filteredPromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPromotions.map((promo) => (
                <div
                  key={promo.promotion_id}
                  className={`relative bg-white border border-gray-200 rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md transition ${!promo.is_active ? "opacity-60" : ""}`}
                >
                  {!promo.is_active && (
                    <div className="absolute top-3 right-3 bg-gray-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ไม่ใช้งาน
                    </div>
                  )}
                  <div className="flex-grow flex flex-col">
                    <div className="flex-grow">
                      {promo.image_url && (
                        <img
                          src={promo.image_url}
                          alt={promo.name}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3
                        className={`text-lg font-bold ${!promo.is_active ? "text-gray-500" : "text-gray-800"}`}
                      >
                        {promo.name || promo.coupon_code}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 h-10 overflow-hidden">
                        {promo.description}
                      </p>
                      <div className="text-center my-2 py-2 bg-amber-50 border-2 border-dashed border-amber-200 rounded-lg">
                        <p className="font-mono text-amber-600 text-lg font-bold tracking-widest">
                          {promo.coupon_code}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mt-3">
                        <p>
                          <strong>ส่วนลด:</strong> {promo.discount_value}{" "}
                          {promo.discount_type === "percentage" ? "%" : "บาท"}
                        </p>
                        <p>
                          <strong>ยอดซื้อขั้นต่ำ:</strong>{" "}
                          {promo.min_purchase.toLocaleString()} บาท
                        </p>
                        <p>
                          <strong>ใช้ได้ถึง:</strong>{" "}
                          {formatDate(promo.expiry_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditClick(promo)}
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
                        </svg>{" "}
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteClick(promo)}
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
                        </svg>{" "}
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">ไม่พบโปรโมชั่น</p>
          )}
          <div className="mt-6 text-sm text-gray-500 border-t pt-4">
            โปรโมชั่นทั้งหมด {filteredPromotions.length} รายการ
          </div>
        </>
      )}

      <EditPromotionModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        promotion={currentPromotion}
        onSave={handleSavePromotion}
        isLoading={isLoading}
      />

      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ open: false, subtitle: "" })}
        title="สำเร็จ"
        subtitle={successModal.subtitle}
        primaryText="ตกลง"
        primaryHref="#"
      />
      <ErrorModal
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, subtitle: "" })}
        title="เกิดข้อผิดพลาด"
        subtitle={errorModal.subtitle}
      />
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบ"
        subtitle={`คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่น "${promotionToDelete?.coupon_code}"?`}
      />
    </div>
  );
}
