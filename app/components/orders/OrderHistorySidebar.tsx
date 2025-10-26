"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../../contexts/CartContext";
import { useLanguageContext } from "@/app/contexts/language-context";
import { getOrderHistoryCopy } from "@/app/lib/translations";
import Image from "next/image";

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

export function OrderHistorySidebar() {
  const { 
    isOrderHistorySidebarOpen: isOpen, 
    closeOrderHistorySidebar: onClose,
    currentUser
  } = useCart();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language: currentLanguage } = useLanguageContext();
  const t = getOrderHistoryCopy(currentLanguage);

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  const fetchOrderHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!currentUser?.id) {
      setError(t.error.loginRequired);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError(t.error.authError);
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
          errorData.message ||
            `Failed to fetch orders (Status: ${response.status})`,
        );
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message || t.error.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentUser]);

  useEffect(() => {
    if (isOpen) {
      fetchOrderHistory();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, fetchOrderHistory]);

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
    return t.status[status] || status;
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
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-lg transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {t.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t.closeAriaLabel}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {loading && (
              <div className="flex flex-col justify-center items-center h-48 space-y-2">
                <div className="animate-spin h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
                <p className="text-gray-500">{t.loading}</p>
              </div>
            )}

            {error && !loading && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="text-center py-12 text-gray-500 rounded-lg bg-white shadow">
                <p>{t.noOrders}</p>
                <p className="mt-2 text-sm">{t.tryOrdering}</p>
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
                          {t.orderId}: #{order.order_id}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {t.orderDate}: {formatDate(order.order_date)}
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
                        {t.totalPrice}: ฿{parseFloat(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t.paymentMethod}: {order.payment_method}
                      </p>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <h3 className="text-md font-semibold text-gray-800">
                        {t.items}:
                      </h3>
                      {order.items.map((item) => (
                        <div
                          key={item.order_item_id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-md border border-gray-100"
                        >
                          <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <Image
                                src={item.product_image}
                                alt={item.product_name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = "/images/placeholder-food.png"; // Fallback image
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs p-1 text-center">
                                {t.noImage}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {item.product_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t.quantity}: {item.quantity} x ฿{parseFloat(item.price).toFixed(2)}
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
                            ฿
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
