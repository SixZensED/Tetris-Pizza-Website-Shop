"use client";

import React from "react";
import ConfirmModal from "./confirm-modal";
import { useCart } from "../../../contexts/CartContext";

export default function GlobalRemoveConfirmModal() {
  const {
    showRemoveConfirmModal,
    itemToRemoveName,
    closeRemoveConfirmModal,
    executeRemoveItem,
    isLoading, // Assuming isLoading from CartContext can be used for button disable state
  } = useCart();

  const handleConfirm = async () => {
    await executeRemoveItem();
  };

  return (
    <ConfirmModal
      open={showRemoveConfirmModal}
      onClose={closeRemoveConfirmModal}
      onConfirm={handleConfirm}
      title="ยืนยันการลบสินค้า"
      subtitle={`คุณแน่ใจหรือไม่ว่าต้องการลบ "${itemToRemoveName}" ออกจากตะกร้า?`}
      primaryText={isLoading ? "กำลังดำเนินการ..." : "ตกลง"}
      secondaryText="ยกเลิก"
      primaryButtonDisabled={isLoading}
    />
  );
}
