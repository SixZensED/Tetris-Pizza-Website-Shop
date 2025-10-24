"use client";

import React from "react";
import SuccessModal from "./success-modal";
import { useCart } from "../../../contexts/CartContext";

export default function GlobalRemoveSuccessModal() {
  const {
    showRemoveSuccessModal,
    removeSuccessMessage,
    closeRemoveSuccessModal,
  } = useCart();

  return (
    <SuccessModal
      open={showRemoveSuccessModal}
      onClose={closeRemoveSuccessModal}
      title="ลบสินค้าสำเร็จ!"
      subtitle={removeSuccessMessage}
      primaryText="ตกลง"
      onPrimaryAction={closeRemoveSuccessModal}
    />
  );
}
