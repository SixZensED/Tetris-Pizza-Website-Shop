"use client";

import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useLanguageContext } from "@/app/contexts/language-context";
import { getTopBarCopy, getCartSidebarCopy } from "@/app/lib/translations";

// --- Type Definitions ---
interface CurrentUser {
  id: number;
  address_id: number;
}

export function CartSidebar() {
  const { isCartOpen, closeCartSidebar } = useCart();
  const isOpen = isCartOpen;
  const onClose = closeCartSidebar;
  // --- Component State ---

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { language: currentLanguage } = useLanguageContext();
  const copy = getTopBarCopy(currentLanguage);
  const cartCopy = getCartSidebarCopy(currentLanguage);
  
  // Use cartCopy directly for translations

  const {
    cart,
    fetchCart,
    removeFromCart,
    openPurchaseConfirmModal,
    currentUser,
    balance,
    isLoading,
    openRemoveConfirmModal,
  } = useCart();

  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  // --- API Logic ---

  // Monitor authentication changes
  useEffect(() => {
    const checkAuthChange = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      return { token, userId };
    };

    // Set up interval to check for authentication changes
    const interval = setInterval(() => {
      const currentAuth = checkAuthChange();
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("user_id");

      // If authentication state has changed (user logged in/out or switched accounts)
      if (
        currentAuth.token !== storedToken ||
        currentAuth.userId !== storedUserId
      ) {
        if (isOpen) {
          fetchCart(); // Refresh cart data if sidebar is open
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isOpen, fetchCart]);

  // Also listen for storage events (when localStorage changes in other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === "token" || e.key === "user_id") && isOpen) {
        fetchCart(); // Refresh cart when auth tokens change and sidebar is open
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isOpen, fetchCart]);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, fetchCart]);

  const handlePurchase = () => {
    if (!API_URL || !currentUser || !cart || cart.items.length === 0) {
      setPaymentError(cartCopy.paymentFailed);
      return;
    }
    if (balance === null || parseFloat(balance) < cart.total_price) {
      setPaymentError(cartCopy.insufficientBalance);
      return;
    }
    setPaymentError(null);
    setPaymentStatus('processing');
    openPurchaseConfirmModal(cart.total_price, currentUser.id, parseFloat(balance));
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg text-[#000000] font-semibold">{cartCopy.yourCart || 'Your Cart'}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={cartCopy.close}
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
          <div className="flex-1 p-4 overflow-y-auto">
            {loading && <p className="text-center text-gray-500">{cartCopy.loading || 'Loading...'}</p>}
            {error && !loading && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            {!loading && !error && currentUser && (
              <>
                {!cart || cart.items.length === 0 ? (
                  <div className="text-center text-gray-500 pt-10">
                    {cartCopy.emptyCart || 'Your cart is empty'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-2 border-b"
                      >
                        <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/images/placeholder-food.png";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
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
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-gray-800 truncate">
                            {item.name || "สินค้า"}
                          </p>
                          {item.options && item.options.length > 0 && (
                            <div className="text-xs text-gray-500 space-y-1 mt-1">
                              {item.options.map((opt, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="flex items-start"
                                >
                                  <span className="text-gray-600">•</span>
                                  <span className="ml-1">
                                    {opt.option_name}
                                    {opt.additional_price > 0 &&
                                      `(+฿${opt.additional_price})`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => {
                              if (!item.cart_item_id) {
                                console.error(
                                  "No cart_item_id found for item:",
                                  item,
                                );
                                setError(
                                  "Cannot remove item: Missing cart item ID",
                                );
                                return;
                              }
                              openRemoveConfirmModal(
                                item.cart_item_id,
                                item.name,
                              );
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 -mr-1"
                            aria-label="Remove item"
                            title="Remove item"
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
                          <div className="bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                            <p className="text-sm font-medium text-amber-800">
                              ฿
                              {(item.price * item.quantity).toLocaleString(
                                "th-TH",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                              {item.quantity > 1 && (
                                <span className="text-xs text-amber-600 ml-1">
                                  (฿
                                  {item.price.toLocaleString("th-TH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}{" "}
                                  x {item.quantity})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!loading &&
            !error &&
            currentUser &&
            cart &&
            cart.items.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{cartCopy.yourBalance || 'Your Balance'}</span>
                    <span className="font-semibold text-yellow-600">
                      {balance 
                        ? parseFloat(balance).toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '...'}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{cartCopy.total}</span>
                    <span>฿{cart.total_price.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    openPurchaseConfirmModal(
                      cart.total_price,
                      currentUser.id,
                      Number(balance), // balance is checked before this is called
                    )
                  }
                  disabled={
                    isLoading ||
                    balance === null ||
                    Number(balance) < (cart?.total_price ?? 0)
                  }
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? cartCopy.processingPayment : cartCopy.checkout}
                </button>

                {paymentStatus && (
                  <div className="mt-3 p-2 text-sm bg-green-100 text-green-800 rounded text-center">
                    {paymentStatus === 'success' 
                      ? cartCopy.paymentSuccess 
                      : paymentStatus === 'processing' 
                        ? cartCopy.processingPayment 
                        : paymentStatus}
                  </div>
                )}
                {paymentError && (
                  <div className="mt-3 p-2 text-sm bg-red-100 text-red-800 rounded text-center">
                    {paymentError}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
