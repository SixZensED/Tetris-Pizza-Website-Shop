"use client";

import { useState } from 'react';
import { getAuthHeaders } from '../../lib/auth';
import SuccessModal from './success/success-modal';
import { useCart } from '../../contexts/CartContext';

interface TrueMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrueMoneyModal({ isOpen, onClose }: TrueMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { refreshCart } = useCart();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    if (!amount || Number(amount) <= 0) {
      alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/add-balance`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: Number(amount) }),
      });

      if (response.ok) {
        // Don't set isLoading to false here, let the modal transition
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'ไม่สามารถเติมเงินได้');
        setIsErrorModalOpen(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error submitting amount:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      setIsErrorModalOpen(true);
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = async () => {
    setIsSuccessModalOpen(false);
    setAmount('');
    await refreshCart(); // Refresh user balance and cart
    onClose(); // Close the main modal completely.
    window.location.reload(); // Reload the page to update the UI
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage('');
  };

  return (
    <>
      <SuccessModal
        open={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title="เกิดข้อผิดพลาด"
        subtitle={errorMessage}
        primaryText="ลองอีกครั้ง"
        onPrimaryAction={handleCloseErrorModal}
        variant="error"
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="เติมเงินสำเร็จ!"
        subtitle={`จำนวน ${Number(amount).toLocaleString()} บาท ได้ถูกเพิ่มเข้าสู่บัญชีของคุณแล้ว`}
        primaryText="ตกลง"
        onPrimaryAction={handleCloseSuccessModal}
        variant="success"
      />

      {isOpen && !isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white text-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">เติมเงินผ่าน TrueMoney</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ใส่จำนวนเงินที่ต้องการเติม"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-semibold">
                ยกเลิก
            </button>
            <button
                type="submit"
                disabled={!amount || Number(amount) <= 0 || isLoading}
                className="px-6 py-2 rounded-lg bg-[#b21807] text-white font-semibold hover:bg-[#9c1506] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'กำลังดำเนินการ...' : 'เติมเงิน'}
            </button>
          </div>
        </form>
      </div>
      </div>
      )}
    </>
  );
}
