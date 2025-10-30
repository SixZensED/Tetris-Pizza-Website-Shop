"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { getTopBarCopy, type TopBarCopy, type LanguageCode } from "../lib/translations";
import { useLanguageContext } from "./language-context";

interface CurrentUser {
  id: string;
  address_id: number;
  isAdmin: boolean;
  name: string;
  email: string;
  avatar?: string;
  balance: string;
}

interface CartItemOption {
  option_id: number;
  option_name: string;
  option_type: string;
  additional_price: number;
}

interface CartItem {
  cart_item_id: number;
  product_id: number;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  options: CartItemOption[];
}

interface Cart {
  cart_id: number;
  user_id: string;
  items: CartItem[];
  total_price: number;
  total_items: number;
}

// Define the shape of the context
export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  isCartOpen: boolean;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;

  isOrderHistorySidebarOpen: boolean;
  openOrderHistorySidebar: () => void;
  closeOrderHistorySidebar: () => void;

  addToCart: (
    productId: number,
    quantity: number,
    options?: CartItemOption[],
  ) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  currentUser: CurrentUser | null;
  balance: string | null; // Changed to string | null
  logout: () => void;

  showPurchaseConfirmModal: boolean;
  purchaseConfirmationData: {
    totalAmount: number;
    userId: string;
    balance: number;
  } | null;
  openPurchaseConfirmModal: (
    totalAmount: number,
    userId: string,
    userBalance: number,
  ) => void;
  closePurchaseConfirmModal: () => void;
  processPurchase: () => Promise<void>;

  showRemoveConfirmModal: boolean;
  itemToRemove: number | null;
  itemToRemoveName: string;
  openRemoveConfirmModal: (itemId: number, itemName: string) => void;
  closeRemoveConfirmModal: () => void;
  executeRemoveItem: () => Promise<void>;

  showRemoveSuccessModal: boolean;
  removeSuccessMessage: string;
  closeRemoveSuccessModal: () => void;

  showPurchaseSuccessModal: boolean;
  purchaseSuccessMessage: string;
  closePurchaseSuccessModal: () => void;

  currentLanguage: LanguageCode; // From LanguageContext
  copy: TopBarCopy; // Use imported TopBarCopy
}

// Create the context
export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

// Create the provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sidebar states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderHistorySidebarOpen, setIsOrderHistorySidebarOpen] =
    useState(false);

  // User and Balance states
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [balance, setBalance] = useState<string | null>(null); // State for balance in CartContext

  // Get language from LanguageContext
  const { language: currentLanguage, copy } = useLanguageContext();

  // Global purchase confirmation modal states
  const [showPurchaseConfirmModal, setShowPurchaseConfirmModal] =
    useState(false);
  const [purchaseConfirmationData, setPurchaseConfirmationData] = useState<{
    totalAmount: number;
    userId: string;
    balance: number;
  } | null>(null);

  // Global item removal confirmation modal states
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [itemToRemoveName, setItemToRemoveName] = useState<string>("");

  // Global item removal success modal states
  const [showRemoveSuccessModal, setShowRemoveSuccessModal] = useState(false);
  const [removeSuccessMessage, setRemoveSuccessMessage] = useState("");

  // Global purchase success modal states
  const [showPurchaseSuccessModal, setShowPurchaseSuccessModal] =
    useState(false);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  // --- Sidebar functions ---
  const openCartSidebar = useCallback(() => setIsCartOpen(true), []);
  const closeCartSidebar = useCallback(() => setIsCartOpen(false), []);
  const openOrderHistorySidebar = useCallback(
    () => setIsOrderHistorySidebarOpen(true),
    [],
  );
  const closeOrderHistorySidebar = useCallback(
    () => setIsOrderHistorySidebarOpen(false),
    [],
  );

  // --- Functions to control the global purchase confirmation modal ---
  const openPurchaseConfirmModal = useCallback(
    (totalAmount: number, userId: string, userBalance: number) => {
      setPurchaseConfirmationData({
        totalAmount,
        userId,
        balance: userBalance,
      });
      setShowPurchaseConfirmModal(true);
    },
    [],
  );

  const closePurchaseConfirmModal = useCallback(() => {
    setShowPurchaseConfirmModal(false);
    setPurchaseConfirmationData(null); // Clear data after closing
  }, []);

  // --- Function to fetch the user's cart AND user details/balance ---
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear errors
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart(null);
        setCurrentUser(null); // Clear user info
        setBalance(null); // Clear balance
        return;
      }

      const authHeader = { Authorization: `Bearer ${token}` };

      // Fetch user data and balance
      const userResponse = await fetch(`${apiBaseUrl}/api/me`, {
        headers: authHeader,
      });
      if (!userResponse.ok) {
        if (userResponse.status === 401 || userResponse.status === 403) {
          // Token expired or invalid, log out
          console.warn("User token invalid or expired, logging out.");
          localStorage.removeItem("token");
          localStorage.removeItem("user_id"); // Clear user_id as well
          setCurrentUser(null);
          setBalance(null);
          setCart(null);
          return;
        }
        const errorData = await userResponse.json();
        throw new Error(
          errorData.message ||
            "Could not authenticate user or fetch user data.",
        );
      }
      const userData = await userResponse.json();
      setCurrentUser({
        id: String(userData.userId), // Ensure userId is string
        address_id: userData.address_id || 1, // Default address_id if missing
        isAdmin: userData.role === "admin", // Determine if user is admin
        name: userData.fullName || userData.email || "User", // Use full name, fallback to email or "User"
        email: userData.email,
        avatar: userData.avatar_url, // Assuming an avatar_url might exist in userData
        balance: String(userData.balance), // Ensure balance is string
      });
      setBalance(String(userData.balance)); 

      // --- Cart fetching logic (existing) ---
      const response = await fetch(`${apiBaseUrl}/api/cart`, {
        headers: authHeader, // Use the same authHeader
      });

      if (!response.ok) {
        if (response.status === 404) {
          setCart(null); // Cart not found, might be empty for a new user
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cart");
        }
      } else {
        const cartData = await response.json();

        // Transform selected_options into the expected options array format
        const transformedCart = {
          ...cartData,
          items: cartData.items.map(
            (item: {
              selected_options?: Record<
                string,
                Array<{
                  additional_price: number;
                  option_id: number;
                  option_name: string;
                }>
              >;
              price: number;
              quantity: number;
              cart_item_id: number;
              product_id: number;
              name: string;
              image_url: string;
            }) => {
              // Calculate total additional price from all options
              const totalOptionsPrice = item.selected_options
                ? Object.values(
                    item.selected_options as Record<
                      string,
                      Array<{ additional_price: number }>
                    >,
                  )
                    .flat()
                    .reduce((sum, opt) => sum + (opt.additional_price || 0), 0)
                : 0;

              // Create the options array with type information
              const options = item.selected_options
                ? Object.entries(item.selected_options).flatMap(
                    ([type, options]) =>
                      options.map((opt) => ({
                        ...opt,
                        option_type: type,
                      })),
                  )
                : [];

              return {
                ...item,
                options,
                // Update the item's price to include the additional options
                price: (item.price || 0) + totalOptionsPrice,
              };
            },
          ),
        };

        // Recalculate the total price and total items based on all items
        const totalPrice = transformedCart.items.reduce(
          (sum: number, item: { price: number; quantity: number }) =>
            sum + item.price * item.quantity,
          0,
        );

        transformedCart.total_price = totalPrice;
        transformedCart.total_items = transformedCart.items.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0,
        );


        setCart(transformedCart);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
      setCart(null); // Clear cart on error
      setCurrentUser(null); // Clear user info on error
      setBalance(null); // Clear balance on error
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  // Alias fetchCart to refreshCart for clarity
  const refreshCart = fetchCart;

  // --- Function to remove an item from the cart ---
  const removeFromCart = useCallback(
    async (itemId: number) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(`${apiBaseUrl}/api/cart/items/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove item from cart");
        }

        // ✅ แก้ให้แค่ update cart state ภายใน ไม่ต้อง fetch ใหม่
        setCart((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((item) => item.cart_item_id !== itemId),
                total_items: prev.total_items - 1,
                total_price: prev.items
                  .filter((item) => item.cart_item_id !== itemId)
                  .reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ),
              }
            : prev
        );
      } catch (err: unknown) {
        setError((err as Error).message);
        throw err;
      }
    },
    [apiBaseUrl],
  );

  // --- Global item removal confirmation modal functions ---
  const openRemoveConfirmModal = useCallback(
    (itemId: number, itemName: string) => {
      setItemToRemove(itemId);
      setItemToRemoveName(itemName);
      setShowRemoveConfirmModal(true);
    },
    [],
  );

  const closeRemoveConfirmModal = useCallback(() => {
    setShowRemoveConfirmModal(false);
    setItemToRemove(null);
    setItemToRemoveName("");
  }, []);

  const executeRemoveItem = useCallback(async () => {
    if (itemToRemove === null) return;
    setShowRemoveConfirmModal(false); // Close modal immediately
    try {
      await removeFromCart(itemToRemove); // Use the existing removeFromCart
      await fetchCart(); // Ensure user data/balance is refreshed
      setRemoveSuccessMessage(
        `สินค้า "${itemToRemoveName}" ถูกลบออกจากตะกร้าแล้ว!`,
      );
      setShowRemoveSuccessModal(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to remove item.");
    } finally {
      setItemToRemove(null);
      setItemToRemoveName("");
    }
  }, [itemToRemove, itemToRemoveName, removeFromCart, fetchCart]);

  const closeRemoveSuccessModal = useCallback(() => {
    setShowRemoveSuccessModal(false);
    setRemoveSuccessMessage("");
  }, []);

  // --- Purchase processing logic ---
  const processPurchase = useCallback(async () => {
    if (
      !apiBaseUrl ||
      !purchaseConfirmationData ||
      !cart ||
      cart.items.length === 0 ||
      !currentUser ||
      balance === null
    ) {
      setError(
        "Cannot process purchase. Missing information or cart is empty.",
      );
      closePurchaseConfirmModal();
      return;
    }

    const { totalAmount, userId: purchaseUserId } = purchaseConfirmationData;

    // Convert balance to number for comparison
    if (Number(balance) < totalAmount) {
      setError("ยอดเงินของคุณไม่พอสำหรับการสั่งซื้อนี้");
      closePurchaseConfirmModal();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      // Process the purchase first
      const payload = {
        user_id: purchaseUserId,
        address_id: currentUser.address_id || 1,
        total_amount: totalAmount,
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          price_per_unit: item.price,
          cart_item_id: item.cart_item_id, // Include cart_item_id for removal
          options: item.options.map((opt) => ({
            option_id: opt.option_id,
            option_name: opt.option_name,
            option_type: opt.option_type,
            additional_price: opt.additional_price,
          })),
        })),
      };

      // Process the purchase
      const response = await fetch(`${apiBaseUrl}/api/payments/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update balance from the response
        if (result.new_balance !== undefined) {
          setBalance(String(result.new_balance));
        }

        // Remove each purchased item from the cart one by one
        const removePromises = cart.items.map(item => 
          removeFromCart(item.cart_item_id).catch(err => {
            console.error(`Error removing item ${item.cart_item_id}:`, err);
            return null; // Continue with other items even if one fails
          })
        );

        // Wait for all items to be removed
        await Promise.all(removePromises);
        
        // Update the cart state to reflect the changes
        const updatedCart = {
          ...cart,
          items: [],
          total_price: 0,
          total_items: 0
        };
        setCart(updatedCart);
        
        // Close the confirmation modal
        closePurchaseConfirmModal();
        
        // Show success message
        setPurchaseSuccessMessage(
          `สั่งซื้อสำเร็จ! Order ID: ${result.order_id || 'N/A'}`,
        );
        setShowPurchaseSuccessModal(true);
        
        // Refresh cart data from server to ensure consistency
        await fetchCart().catch(err => {
          console.error('Error refreshing cart:', err);
        });
      } else {
        let errorMessage = `Error: ${result.error}`;
        if (result.current_coins !== undefined) {
          errorMessage += ` (คุณมี ${result.current_coins} Coins, ต้องการ ${result.required} Coins).`;
        }
        setError(errorMessage);
        closePurchaseConfirmModal();
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message ||
          "An unknown network error occurred during purchase.",
      );
      closePurchaseConfirmModal();
    } finally {
      setIsLoading(false);
    }
  }, [
    apiBaseUrl,
    purchaseConfirmationData,
    cart,
    currentUser,
    balance,
    fetchCart,
    closePurchaseConfirmModal,
    setBalance,
  ]);

  const closePurchaseSuccessModal = useCallback(() => {
    setShowPurchaseSuccessModal(false);
    setPurchaseSuccessMessage("");
  }, []);

  // --- Function to add an item to the cart ---
  const addToCart = async (
    productId: number,
    quantity: number,
    options?: Array<{
      option_id: number;
      option_name: string;
      option_type: string;
      additional_price: number;
    }>,
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าในตะกร้า");
      }

      const body: {
        product_id: number;
        quantity: number;
        options?: Array<{
          option_id: number;
          option_name: string;
          option_type: string;
          additional_price: number;
        }>;
      } = {
        product_id: productId,
        quantity,
      };

      if (options && options.length > 0) {
        body.options = options;
      }

      const response = await fetch(`${apiBaseUrl}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      await fetchCart();
    } catch (err: unknown) {
      setError((err as Error).message);
      throw err;
    }
  };

  // --- Logout function ---
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id"); // Ensure user_id is cleared
    // Optionally clear other user-related localStorage items
    setCurrentUser(null);
    setBalance(null);
    setCart(null); // Clear cart on logout
    setError(null); // Clear any errors
    // Trigger a storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent("storage", { key: "token" }));
  }, []);

  // Fetch cart on initial load
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Listen for storage events (when localStorage changes in other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user_id") {
        fetchCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        isCartOpen,
        openCartSidebar,
        closeCartSidebar,
        isOrderHistorySidebarOpen,
        openOrderHistorySidebar,
        closeOrderHistorySidebar,
        addToCart,
        removeFromCart,
        fetchCart,
        refreshCart,
        currentUser,
        balance,
        logout,
        showPurchaseConfirmModal,
        purchaseConfirmationData,
        openPurchaseConfirmModal,
        closePurchaseConfirmModal,
        processPurchase,
        showRemoveConfirmModal,
        itemToRemove,
        itemToRemoveName,
        openRemoveConfirmModal,
        closeRemoveConfirmModal,
        executeRemoveItem,
        showRemoveSuccessModal,
        removeSuccessMessage,
        closeRemoveSuccessModal,
        showPurchaseSuccessModal,
        purchaseSuccessMessage,
        closePurchaseSuccessModal,
        currentLanguage,
        copy,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
