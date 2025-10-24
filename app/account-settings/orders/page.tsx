"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../../contexts/CartContext"; // Assuming CartContext has currentUser and balance

interface Customization {
  [key: string]: string | string[];
}

interface OrderItem {
  order_item_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: string;
  customizations: Customization;
}

interface Order {
  order_id: number;
  total_amount: string;
  status: "pending_delivery" | "completed" | "cancelled";
  order_date: string;
  payment_method: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCart(); // Get currentUser from CartContext

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  const fetchOrderHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!currentUser?.id) {
      setError("กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("ไม่พบข้อมูลการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/payments/users/${currentUser.id}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to fetch orders (Status: ${response.status})`,
        );
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentUser]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending_delivery":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending_delivery":
        return "รอดำเนินการ";
      case "completed":
        return "จัดส่งสำเร็จ";
      case "cancelled":
        return "ยกเลิกแล้ว";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ประวัติการสั่งซื้อ</h1>
        <p className="mt-2 text-gray-600">ดูคำสั่งซื้อที่ผ่านมาของคุณทั้งหมด</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && !loading && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500 rounded-lg bg-white shadow">
          <p>ไม่พบประวัติการสั่งซื้อ</p>
          <p className="mt-2 text-sm">ลองสั่งอาหารอร่อยๆ ได้เลย!</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Order ID: #{order.order_id}
                  </h2>
                  <p className="text-sm text-gray-500">
                    เมื่อวันที่: {formatDate(order.order_date)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-lg font-bold text-gray-700">
                  ราคารวม: ฿{parseFloat(order.total_amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  วิธีการชำระเงิน: {order.payment_method}
                </p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800">
                  รายการสินค้า:
                </h3>
                {order.items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/images/placeholder-food.png"; // Fallback image
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                          ไม่มีรูปภาพ
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        จำนวน: {item.quantity} x ฿
                        {parseFloat(item.price).toFixed(2)}
                      </p>
                      {item.customizations &&
                        Object.keys(item.customizations).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                            {Object.entries(item.customizations).map(
                              ([key, value]) => (
                                <p key={key}>
                                  {key}:{" "}
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : value}
                                </p>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      ฿{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
