"use client";

import { useState, useEffect } from "react";
import EditAdminUserModal from "../components/EditAdminUserModal";
import SuccessModal from "../../components/modals/success/success-modal";
import ConfirmModal from "../../components/modals/confirm/confirm-modal";

interface User {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  coins: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<User | null>(null);

  // State for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("ไม่ได้รับอนุญาต");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }

        const data = await response.json();
        const processedUsers = data.users.map((user: User) => {
          const parsedCoins = parseFloat(user.coins as unknown as string) || 0;
          return {
            ...user,
            coins: parsedCoins,
          };
        });
        const sortedUsers = processedUsers.sort(
          (a, b) => Number(a.userId) - Number(b.userId),
        );
        setUsers(sortedUsers);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditClick = (user: User) => {
    setCurrentUserToEdit({
      ...user,
      name: user.fullName,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
  };

  const refreshUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("ไม่ได้รับอนุญาต");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }

      const data = await response.json();
      const processedUsers = data.users.map((user: User) => ({
        ...user,
        coins: parseFloat(user.coins as unknown as string) || 0,
      }));

      const sortedUsers = processedUsers.sort(
        (a: User, b: User) => Number(a.userId) - Number(b.userId),
      );

      setUsers(sortedUsers);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    refreshUsers();
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID from token when component mounts
  useEffect(() => {
    // Get current user ID from token when component mounts
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  const handleDeleteClick = (user: User) => {
    if (user.userId === currentUserId) {
      setError("ไม่สามารถลบบัญชีของตัวเองได้");
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("ไม่ได้รับอนุญาต: ไม่พบโทเค็น");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userToDelete.userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        let errorMessage = "ไม่สามารถลบผู้ใช้ได้";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      setSuccessMessage("ลบผู้ใช้สำเร็จ");
      setShowSuccessModal(true);
      refreshUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

const handleSaveEdit = async (updatedUserFromModal: User) => {
  if (!currentUserToEdit) return;

  const updatePayload: { role?: string; coins?: number } = {};
  const editingUserId = currentUserToEdit.userId;

  // ✅ อนุญาตให้แก้ไข coins ของตัวเองได้
  // แต่ยังห้ามเปลี่ยน role ของตัวเอง
  if (
    currentUserToEdit.userId === currentUserId &&
    updatedUserFromModal.role !== currentUserToEdit.role
  ) {
    setError("ไม่สามารถเปลี่ยนบทบาทของตัวเองได้");
    return;
  }

  // ตรวจว่ามีอะไรเปลี่ยนจริงไหม
  if (updatedUserFromModal.role !== currentUserToEdit.role) {
    updatePayload.role = updatedUserFromModal.role;
  }
  if (updatedUserFromModal.coins !== currentUserToEdit.coins) {
    updatePayload.coins = updatedUserFromModal.coins;
  }

  if (Object.keys(updatePayload).length === 0) {
    handleCloseEditModal();
    setSuccessMessage("ไม่มีการเปลี่ยนแปลงข้อมูลผู้ใช้งาน");
    setShowSuccessModal(true);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("ไม่ได้รับอนุญาต: ไม่พบโทเค็น");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${editingUserId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      },
    );

    if (!response.ok) {
      let errorMessage = "ไม่สามารถอัปเดตผู้ใช้ได้";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    const updatedUserData = await response.json();

    // ✅ อัปเดต state หลังบันทึกสำเร็จ
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === editingUserId
          ? { ...user, ...updatedUserData.user }
          : user,
      ),
    );

    handleCloseEditModal();
    setSuccessMessage("แก้ไขข้อมูลผู้ใช้งานสำเร็จ!");
    setShowSuccessModal(true);
  } catch (err: any) {
    console.error("Error saving user:", err);
    setError(err.message);
  }
};


  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">ผู้ใช้งาน</h1>
          {pagination && (
            <span className="text-gray-500">{pagination.total} คน</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full placeholder-gray-700"
            />
            <div className="absolute top-0 left-0 inline-flex items-center justify-center w-10 h-full text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <p>กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    บทบาท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coins
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(user.coins || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(user)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-[#b21807]"
                        title="แก้ไขข้อมูล"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(user);
                        }}
                        disabled={user.userId === currentUserId || isLoading}
                        className={`ml-4 transition-colors ${user.userId === currentUserId ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-600"}`}
                        title={
                          user.userId === currentUserId
                            ? "ไม่สามารถลบบัญชีตัวเองได้"
                            : "ลบผู้ใช้"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  แสดง{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}
                  </span>{" "}
                  จาก <span className="font-medium">{pagination.total}</span>{" "}
                  ผลลัพธ์
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                {[...Array(pagination.pages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 text-sm font-medium rounded-md border ${
                      currentPage === index + 1
                        ? "bg-[#b21807] text-white border-[#b21807]"
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit User Modal using EditAdminUserModal component */}
      {isEditModalOpen && currentUserToEdit && (
        <EditAdminUserModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={currentUserToEdit}
          onSave={handleSaveEdit}
          isLoading={isLoading}
          currentUserId={currentUserId}
        />
      )}

      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="สำเร็จ"
        subtitle={successMessage}
        primaryText="ตกลง"
        primaryHref="#"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!userToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบผู้ใช้"
        subtitle={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ ${userToDelete?.fullName} (อีเมล: ${userToDelete?.email})? การกระทำนี้ไม่สามารถย้อนกลับได้`}
      />
    </div>
  );
}
