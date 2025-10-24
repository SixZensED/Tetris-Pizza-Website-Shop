"use client";

import React from "react";
import ConfirmModal from "./confirm-modal";
import { useCart } from "../../../contexts/CartContext";

export default function GlobalPurchaseConfirmModal() {
  const {
    showPurchaseConfirmModal,
    purchaseConfirmationData,
    closePurchaseConfirmModal,
    processPurchase,
    isLoading, // Using isLoading from CartContext for button disable state
  } = useCart();

  const handleConfirm = async () => {
    await processPurchase();
  };

  return (
    <ConfirmModal
      open={showPurchaseConfirmModal}
      onClose={closePurchaseConfirmModal}
      onConfirm={handleConfirm}
      title="ยืนยันการสั่งซื้อ"
      subtitle={
        purchaseConfirmationData?.totalAmount
          ? `คุณต้องการยืนยันการสั่งซื้อจำนวน ฿${purchaseConfirmationData.totalAmount.toFixed(
              2,
            )} หรือไม่?`
          : "คุณต้องการยืนยันการสั่งซื้อหรือไม่?"
      }
      primaryText={isLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
      secondaryText="ยกเลิก"
      primaryButtonDisabled={isLoading}
    />
  );
}
