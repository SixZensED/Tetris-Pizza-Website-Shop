"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function EditProfileModal({
  open,
  onClose,
  profile,
  handleInputChange,
  handleSubmit,
}) {
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
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
