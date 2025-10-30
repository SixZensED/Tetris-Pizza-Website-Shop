"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiLink, FiUser } from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: {
    name: string;
    email: string;
    phone?: string;
    profileUrl?: string;
    [key: string]: any;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onProfilePictureChange?: (url: string) => void;
}

export default function EditProfileModal({
  open,
  onClose,
  profile,
  handleInputChange,
  handleSubmit,
  onProfilePictureChange,
}: EditProfileModalProps) {
  const [imageUrl, setImageUrl] = useState(profile.profileUrl || '');
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http') || url.startsWith('https') || url.startsWith('/');
    } catch {
      return false;
    }
  };

  const getImageSource = (url: string) => {
    if (!url) return null;
    return isValidUrl(url) ? url : null;
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-100/60 backdrop-blur-[2px] p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-neutral-200/70 md:p-10"
          >
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/60">
              <h2 className="text-2xl font-black text-neutral-900">
                แก้ไขข้อมูลส่วนตัว
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Update the profile with the latest image URL before submitting
              if (onProfilePictureChange && imageUrl !== profile.profileUrl) {
                onProfilePictureChange(imageUrl);
              }
              handleSubmit(e);
            }} className="mt-6 space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-4 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {getImageSource(imageUrl) ? (
                    <Image
                      src={imageUrl}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        setImageError(true);
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                      onLoad={() => setImageError(false)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                      <FiUser className="w-12 h-12 text-gray-400" />
                      {imageError && (
                        <span className="text-xs text-red-500 mt-1">ไม่สามารถโหลดรูปภาพได้</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รูปโปรไฟล์
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="https://example.com/your-image.jpg"
                    className={`flex-1 rounded-lg border ${
                      imageError ? 'border-red-500' : 'border-neutral-300'
                    } px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (onProfilePictureChange) {
                        onProfilePictureChange(imageUrl);
                      }
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    title="อัพเดทรูปโปรไฟล์"
                  >
                    <FiLink className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-neutral-500">กรุณาใส่ URL ของรูปภาพ (เช่น https://example.com/your-image.jpg)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อจริง-นามสกุล
                </label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  placeholder="000-000-0000"
                  maxLength={12}
                  className={`w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition"
                >
                  ยกเลิก
                </button>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full px-8 py-2.5 text-sm font-semibold text-white bg-[#b21807] hover:bg-[#8e1005] transition-all flex items-center justify-center gap-2"
                >
                  บันทึก
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
