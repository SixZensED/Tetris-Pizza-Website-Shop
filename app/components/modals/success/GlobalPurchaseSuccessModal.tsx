"use client";

import React from "react";
import SuccessModal from "./success-modal";
import { useCart } from "../../../contexts/CartContext";

export default function GlobalPurchaseSuccessModal() {
  const {
    showPurchaseSuccessModal,
    purchaseSuccessMessage,
    closePurchaseSuccessModal,
  } = useCart();

  return (
    <SuccessModal
      open={showPurchaseSuccessModal}
      onClose={closePurchaseSuccessModal}
      title="สั่งซื้อสำเร็จ!"
      subtitle={purchaseSuccessMessage}
      primaryText="ตกลง"
      onPrimaryAction={closePurchaseSuccessModal}
    />
  );
}
