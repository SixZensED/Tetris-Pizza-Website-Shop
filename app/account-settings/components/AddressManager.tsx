"use client";

import { useState } from "react";
import { FiMapPin, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import AddressForm from "./AddressForm";
import SuccessModal from "../../components/modals/success/success-modal";
import ConfirmModal from "../../components/modals/confirm/confirm-modal";

interface AddressType {
  address_id: number;
  address_line1: string;
  sub_district: string;
  city: string;
  province: string;
  postal_code: string;
  recipient_name: string;
  phone_number: string;
  address_label: string;
  is_default: boolean;
}

interface AddressManagerProps {
  addresses: AddressType[];
  fetchAddresses: () => void;
  token: string | null;
}

export default function AddressManager({
  addresses,
  fetchAddresses,
  token,
}: AddressManagerProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", subtitle: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null,
  );

  const handleDelete = async (id: number) => {
    try {
      if (!token) return;

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setModalContent({
          title: "ลบที่อยู่สำเร็จ",
          subtitle: "ที่อยู่ของคุณถูกลบเรียบร้อยแล้ว",
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeletingAddressId(id);
    setShowConfirmModal(true);
  };

  const handleAddressSuccess = (action: "create" | "update") => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setModalContent({
      title: action === "create" ? "สร้างที่อยู่สำเร็จ" : "แก้ไขที่อยู่สำเร็จ",
      subtitle: `ที่อยู่ของคุณได้ถูก${action === "create" ? "สร้าง" : "แก้ไข"}เรียบร้อยแล้ว`,
    });
    setShowSuccessModal(true);
  };

  return (
    <div className="space-y-6">
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          fetchAddresses();
        }}
        title={modalContent.title}
        subtitle={modalContent.subtitle}
        primaryText="ตกลง"
        primaryHref="#"
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">ที่อยู่ของฉัน</h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="flex items-center px-4 py-2 bg-[#b21807] text-white rounded-md hover:bg-[#8e1005] transition"
        >
          <FiPlus className="mr-2" />
          เพิ่มที่อยู่ใหม่
        </button>
      </div>

      {/* แสดงรายการที่อยู่ */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div
              key={address.address_id}
              className="border border-gray-300 bg-gray-50 hover:bg-gray-100 transition rounded-lg p-4 relative group shadow-sm"
            >
              {address.is_default && (
                <span className="absolute top-2 right-2 bg-[#b21807]/15 text-[#b21807] text-xs px-2 py-1 rounded font-medium">
                  หลัก
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-[15px]">
                    {address.recipient_name}
                  </h4>
                  <p className="text-gray-800 text-sm">
                    {address.phone_number}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[14px] text-gray-800 leading-relaxed">
                {address.address_line1}
                <br />
                {address.sub_district} {address.city} {address.province}{" "}
                {address.postal_code}
              </p>
              {address.address_label && (
                <span className="inline-block mt-3 px-3 py-1 bg-[#b21807]/10 text-[#b21807] text-xs font-semibold rounded-full">
                  {address.address_label}
                </span>
              )}
              <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingAddress(address);
                    setShowAddressForm(true);
                  }}
                  className="text-[#b21807] hover:text-[#8e1005]"
                  title="แก้ไข"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => openDeleteConfirm(address.address_id)}
                  className="text-gray-500 hover:text-red-600"
                  title="ลบ"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
          <FiMapPin className="mx-auto text-gray-400 text-4xl mb-2" />
          <p className="text-gray-700 font-medium">
            ยังไม่มีที่อยู่ที่บันทึกไว้
          </p>
          <p className="text-sm text-gray-500 mt-1">
            คลิกที่ปุ่ม "เพิ่มที่อยู่ใหม่" เพื่อเพิ่มที่อยู่ของคุณ
          </p>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            if (deletingAddressId) {
              handleDelete(deletingAddressId);
            }
            setShowConfirmModal(false);
          }}
          title="ยืนยันการลบ"
          subtitle="คุณแน่ใจหรือไม่ว่าต้องการลบที่อยู่นี้?"
        />
      )}

      {/* ฟอร์มเพิ่ม/แก้ไข */}
      {showAddressForm && (
        <AddressForm
          address={editingAddress ? {
            address_id: editingAddress.address_id,
            address_line1: editingAddress.address_line1,
            sub_district: editingAddress.sub_district,
            city: editingAddress.city,
            province: editingAddress.province,
            postal_code: editingAddress.postal_code,
            recipient_name: editingAddress.recipient_name,
            phone_number: editingAddress.phone_number,
            address_label: editingAddress.address_label,
            is_default: editingAddress.is_default
          } : undefined}
          onClose={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
          onSuccess={handleAddressSuccess}
        />
      )}
    </div>
  );
}
