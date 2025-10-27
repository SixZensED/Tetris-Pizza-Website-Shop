"use client";

"use client";

import { useState } from 'react';
import TrueMoneyModal from '../components/modals/TrueMoneyModal';

const paymentMethods = [
  {
    id: 'truemoney',
    name: 'TrueMoney Wallet',
    description: 'เติมเงินด้วยลิงก์อั่งเปา',
    icon: '/images/truemoney-icon.png',
  },
  {
    id: 'promptpay',
    name: 'QR PromptPay',
    description: 'สแกน QR Code เพื่อชำระเงิน',
    icon: '/images/promptpay-icon.png',
    disabled: true,
  },
];

export default function TopUpPage() {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [amount, setAmount] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [isTrueMoneyModalOpen, setIsTrueMoneyModalOpen] = useState(false);

  const handlePaymentSelect = (method: typeof paymentMethods[number]) => {
    setSelectedMethod(method);
    if (method.id === 'truemoney') {
      setIsTrueMoneyModalOpen(true);
    } else {
      setStep(2);
    }
  };

  const handleGenerateQR = () => {
    if (amount && Number(amount) > 0) {
      setQrValue(`${selectedMethod.id}-payload-for-${amount}-baht`);
      setStep(3);
    }
  };

  const quickAmounts = [100, 300, 500, 1000];

  return (
    <>
      <TrueMoneyModal isOpen={isTrueMoneyModalOpen} onClose={() => setIsTrueMoneyModalOpen(false)} />
      <div className="flex items-center justify-center p-4">
      <div className="max-w-7xl w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">เลือกช่องทางการเติมเงิน</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentSelect(method)}
                  disabled={method.disabled}
                  className={`relative w-full p-6 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 transform ${
                    method.disabled
                      ? 'cursor-not-allowed'
                      : 'hover:border-red-500 hover:shadow-md hover:-translate-y-1'
                  }`}
                >
                  <div
                    className={`flex items-center w-full ${
                      method.disabled ? 'filter grayscale opacity-60' : ''
                    }`}
                  >
                    <img src={method.icon} alt={method.name} className="w-12 h-12 mr-4" />
                    <div className="text-left">
                      <p className="font-semibold text-lg text-gray-800">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  {method.disabled && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      เร็วๆนี้
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:underline mb-4"> &larr; กลับไปเลือกช่องทาง</button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">เติมเงินผ่าน {selectedMethod.name}</h1>
              <p className="text-gray-500 mt-2">เลือกจำนวนเงินที่ต้องการเติม</p>
            </div>
            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="amount" className="text-sm font-medium text-gray-700">จำนวนเงิน (บาท)</label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ระบุจำนวนเงิน"
                  className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(String(quickAmount))}
                    className={`py-2 px-4 rounded-lg border transition ${amount === String(quickAmount) ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {quickAmount.toLocaleString()} บาท
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerateQR}
              disabled={!amount || Number(amount) <= 0}
              className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              สร้าง QR Code
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
             <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:underline self-start"> &larr; กลับไปแก้ไขจำนวนเงิน</button>
            <p className="font-semibold text-gray-800">สแกน QR Code เพื่อเติมเงินผ่าน {selectedMethod.name}</p>
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <img src="/images/qr-placeholder.png" alt="QR Code" width={200} height={200} />
            </div>
            <p className="text-lg font-bold text-red-600">จำนวน: {Number(amount).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
