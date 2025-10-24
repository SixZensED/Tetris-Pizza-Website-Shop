"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function ChangePasswordModal({
  open,
  onClose,
  passwordFields,
  handlePasswordInputChange,
  handlePasswordChange,
  showPasswords,
  setShowPasswords,
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
                แก้ไขรหัสผ่าน
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordFields.currentPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  >
                    {showPasswords.current ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.443-6.322a1.01 1.01 0 0 1 .783-.38h11.512a1.01 1.01 0 0 1 .783.38l4.443 6.322a1.012 1.012 0 0 1 0 .639l-4.443 6.322a1.01 1.01 0 0 1-.783.38H7.264a1.01 1.01 0 0 1-.783-.38L2.036 12.322Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L6.228 6.228"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordFields.newPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  >
                    {showPasswords.new ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.443-6.322a1.01 1.01 0 0 1 .783-.38h11.512a1.01 1.01 0 0 1 .783.38l4.443 6.322a1.012 1.012 0 0 1 0 .639l-4.443 6.322a1.01 1.01 0 0 1-.783.38H7.264a1.01 1.01 0 0 1-.783-.38L2.036 12.322Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L6.228 6.228"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmNewPassword"
                    value={passwordFields.confirmNewPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  >
                    {showPasswords.confirm ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.443-6.322a1.01 1.01 0 0 1 .783-.38h11.512a1.01 1.01 0 0 1 .783.38l4.443 6.322a1.012 1.012 0 0 1 0 .639l-4.443 6.322a1.01 1.01 0 0 1-.783.38H7.264a1.01 1.01 0 0 1-.783-.38L2.036 12.322Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L6.228 6.228"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>{" "}
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
                  เปลี่ยนรหัสผ่าน
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
