'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialData?: AddressData | null;
}

export interface AddressData {
  recipientName: string;
  phoneNumber: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressForm({ isOpen, onClose, onSave, initialData }: AddressFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<AddressData>(
    initialData || {
      recipientName: '',
      phoneNumber: '',
      address: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '',
      isDefault: false,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {initialData ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                ชื่อผู้รับ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({
                      ...prev,
                      phoneNumber: value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                    }));
                  }}
                  placeholder="เช่น 081-234-5678"
                  maxLength={12}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                ที่อยู่ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="subDistrict" className="block text-sm font-medium text-gray-700">
                  ตำบล/แขวง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subDistrict"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  อำเภอ/เขต <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  รหัสไปรษณีย์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setFormData(prev => ({
                      ...prev,
                      postalCode: value
                    }));
                  }}
                  required
                  maxLength={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b21807] focus:ring-[#b21807] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="isDefault"
                name="isDefault"
                type="checkbox"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#b21807] focus:ring-[#b21807]"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                ตั้งเป็นที่อยู่หลัก
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#b21807] focus:ring-offset-2"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-[#b21807] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#8a1305] focus:outline-none focus:ring-2 focus:ring-[#b21807] focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
