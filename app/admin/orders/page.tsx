"use client";

import React, { useState, useCallback, useEffect } from "react";

interface OrderItem {
  order_item_id: number;
  quantity: number;
  price: string;
  options?: {
    toppings?: string[];
    size?: string;
    crust?: string;
    extra_cheese?: boolean;
    [key: string]: string | number | boolean | string[] | undefined;
  };
  product_name: string;
  product_image: string;
  order_type: string;
}

type OrderStatus =
  | "pending_delivery"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

interface PrimaryAddress {
  address_line1: string | null;
  sub_district: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
}

interface Transaction {
  transaction_id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  order_id: number | null;
  amount: string;
  transaction_type: "purchase" | "topup" | "payment" | string;
  status: string; // Transaction status (e.g., completed, pending, failed)
  description: string;
  created_at: string;
  total_amount: string | null;
  order_status: OrderStatus | null; // Order status from API (e.g., pending_delivery, confirmed)
  items?: OrderItem[]; // Make items optional as it might not be present in all transaction types
  order_type: string;
  primary_address?: PrimaryAddress | null;
}

export default function OrdersPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("กรุณาเข้าสู่ระบบ");
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        throw new Error(data.error || "Failed to fetch transactions");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const updateOrderStatus = useCallback(
    async (orderId: number, action: "confirm" | "cancel") => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("กรุณาเข้าสู่ระบบ");
          return;
        }

        let endpoint = "";
        const method = "PUT";

        if (action === "confirm") {
          endpoint = `${API_URL}/api/payments/orders/${orderId}/confirm`;
        } else if (action === "cancel") {
          endpoint = `${API_URL}/api/payments/orders/${orderId}/cancel`;
        } else {
          throw new Error("Invalid action specified");
        }

        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to ${action} order (Status: ${response.status})`,
          );
        }

        await fetchTransactions();
      } catch (err: unknown) {
        setError(
          (err as Error).message ||
            `เกิดข้อผิดพลาดในการ${action === "confirm" ? "ยืนยัน" : "ยกเลิก"}ออเดอร์`,
        );
      } finally {
        setLoading(false);
      }
    },
    [API_URL, fetchTransactions],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions =
    filterStatus === "all"
      ? transactions
      : transactions.filter((transaction) => {
          if (transaction.transaction_type === "purchase") {
            return transaction.order_status === filterStatus;
          }
          return transaction.status === filterStatus;
        });

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-blue-100 text-blue-800";
      case "topup":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "purchase":
        return "สั่งซื้อ";
      case "topup":
        return "เติมเงิน";
      case "payment":
        return "ชำระเงิน";
      default:
        return type;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending_delivery":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "pending_delivery":
        return "รอดำเนินการ";
      case "failed":
        return "ล้มเหลว";
      default:
        return status;
    }
  };

  const getOrderStatusDisplayColor = (status: OrderStatus | null) => {
    switch (status) {
      case "pending_delivery":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800"; // Handles null or unknown string values
    }
  };

  const getOrderStatusDisplayText = (status: OrderStatus | null) => {
    switch (status) {
      case "pending_delivery":
        return "รอดำเนินการ"; // Matches "รอจัดส่ง" concept
      case "confirmed":
        return "ยืนยันแล้ว";
      case "preparing":
        return "กำลังเตรียม";
      case "ready":
        return "พร้อมเสิร์ฟ";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return "ไม่ทราบสถานะ"; // Handles null or unknown string values
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  const formatAmount = (amount: string | null) => {
    if (amount === null) return "N/A";
    return parseFloat(amount).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleExpand = (transactionId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">จัดการออเดอร์</h1>
          <p className="mt-2 text-gray-600">ดูและจัดการคำสั่งซื้อทั้งหมด</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-6 py-3 bg-[#b21807] text-white rounded-lg hover:bg-[#9a1506] font-medium transition-colors"
        >
          รีเฟรชข้อมูล
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 bg-white rounded-lg shadow p-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "all"
              ? "bg-[#b21807] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ทั้งหมด
        </button>
        {[
          "pending_delivery",
          "completed",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? "bg-[#b21807] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {getOrderStatusDisplayText(status as OrderStatus)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            ไม่พบประวัติการทำรายการในสถานะนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Transaction ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ผู้ใช้
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ประเภท
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สถานะ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จำนวน
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    วันที่
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <React.Fragment key={transaction.transaction_id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(transaction.transaction_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.transaction_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.order_id
                          ? `#${transaction.order_id}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.user_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeColor(
                            transaction.transaction_type,
                          )}`}
                        >
                          {getTransactionTypeText(transaction.transaction_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.transaction_type === "purchase" &&
                        transaction.order_status !== null ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusDisplayColor(
                              transaction.order_status,
                            )}`}
                          >
                            {getOrderStatusDisplayText(
                              transaction.order_status,
                            )}
                          </span>
                        ) : (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionStatusColor(
                              transaction.status,
                            )}`}
                          >
                            {getTransactionStatusText(transaction.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ฿{formatAmount(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {transaction.transaction_type === "purchase" &&
                          transaction.order_id &&
                          transaction.order_status === "pending_delivery" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row from collapsing/expanding
                                  updateOrderStatus(
                                    transaction.order_id!,
                                    "confirm",
                                  );
                                }}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#b21807] hover:bg-[#b21807]  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-[#b21807] "
                              >
                                ยืนยัน
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row from collapsing/expanding
                                  updateOrderStatus(
                                    transaction.order_id!,
                                    "cancel",
                                  );
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          )}
                        {!transaction.order_id &&
                          transaction.transaction_type === "topup" &&
                          transaction.status === "completed" && (
                            <span className="text-gray-400">ไม่มีการกระทำ</span>
                          )}
                      </td>
                    </tr>
                    {expandedOrders.has(transaction.transaction_id) && (
                      <tr>
                        <td colSpan={8} className="p-4 bg-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                              <p className="font-semibold mb-2">
                                รายละเอียดธุรกรรม:
                              </p>
                              <p>
                                <span className="font-medium">
                                  Transaction ID:
                                </span>{" "}
                                {transaction.transaction_id}
                              </p>
                              <p>
                                <span className="font-medium">คำอธิบาย:</span>{" "}
                                {transaction.description}
                              </p>
                              <p>
                                <span className="font-medium">
                                  อีเมลผู้ใช้:
                                </span>{" "}
                                {transaction.user_email}
                              </p>
                              {transaction.order_status &&
                                transaction.transaction_type === "purchase" && (
                                  <>
                                    <p>
                                      <span className="font-medium">
                                        สถานะออเดอร์:
                                      </span>{" "}
                                      {getOrderStatusDisplayText(
                                        transaction.order_status,
                                      )}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        ประเภทออเดอร์:
                                      </span>{" "}
                                      {transaction.order_type}
                                    </p>
                                    {transaction.primary_address && (
                                      <p>
                                        <span className="font-medium">
                                          ที่อยู่:
                                        </span>{" "}
                                        {[ 
                                          transaction.primary_address.address_line1,
                                          transaction.primary_address.sub_district,
                                          transaction.primary_address.city,
                                          transaction.primary_address.province,
                                          transaction.primary_address.postal_code,
                                        ].filter(Boolean).join(", ")}
                                      </p>
                                    )}
                                  </>
                                )}
                            </div>
                            {transaction.items &&
                              transaction.items.length > 0 && (
                                <div>
                                  <p className="font-semibold mb-2">
                                    รายการสินค้า:
                                  </p>
                                  <div className="space-y-2">
                                    {transaction.items.map(
                                      (item, itemIndex) => (
                                        <div
                                          key={itemIndex}
                                          className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                                        >
                                          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.product_image ? (
                                              <img
                                                src={item.product_image}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  const target =
                                                    e.target as HTMLImageElement;
                                                  target.onerror = null;
                                                  target.src =
                                                    "/images/placeholder-food.png";
                                                }}
                                              />
                                            ) : (
                                              <div className="w-full h-12 flex items-center justify-center bg-gray-200 text-gray-400">
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                  />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-800">
                                              {item.product_name}
                                            </p>
                                            {item.options &&
                                              Object.keys(item.options).length >
                                                0 && (
                                                <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                                                  {Object.entries(
                                                    item.options,
                                                  ).map(([key, value]) => (
                                                    <p key={key}>
                                                      {key}:{" "}
                                                      {Array.isArray(value)
                                                        ? value.join(", ")
                                                        : value === true
                                                          ? "Yes"
                                                          : value === false
                                                            ? "No"
                                                            : value}
                                                    </p>
                                                  ))}
                                                </div>
                                              )}
                                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                              <span>
                                                จำนวน: {item.quantity}
                                              </span>
                                              <span className="font-semibold">
                                                ฿
                                                {(
                                                  parseFloat(item.price) *
                                                  item.quantity
                                                ).toLocaleString("th-TH", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
