"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/app/types/products";

// Assuming the API response for options looks like this:
// {
//   "Crust": [ { "option_id": 1, "option_name": "Thin", "additional_price": 0 } ],
//   "Toppings": [ { "option_id": 15, "option_name": "Pepperoni", "additional_price": 30 } ]
// }
interface OptionChoice {
  option_id: number;
  option_name: string;
  additional_price: number;
  is_available?: boolean;
}

interface ProductOptions {
  [option_type: string]: OptionChoice[];
}

interface SelectedOptions {
  [option_type: string]: number | number[]; // single id for radio, array of ids for checkbox
}

interface ProductCustomizationModalProps {
  isOpen: boolean;
  onClose: (wasSuccessful: boolean) => void;
  product: Product;
}

import { useCart } from "@/app/contexts/CartContext";

// ... (rest of the imports)

const ProductCustomizationModal = ({
  isOpen,
  onClose,
  product,
}: ProductCustomizationModalProps) => {
  const [optionsData, setOptionsData] = useState<ProductOptions | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product.price);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  // Fetch options when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Get auth token from localStorage
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;

          // Prepare headers
          const headers: HeadersInit = {};
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          // Fetch options for this product's category from API
          const response = await fetch(
            `${apiBaseUrl}/api/options?category_id=${product.category_id}`,
            {
              headers: headers,
            },
          );

          if (response.status === 401) {
            // Handle unauthorized error
            throw new Error("กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ");
          }

          if (!response.ok) {
            throw new Error("ไม่สามารถโหลดตัวเลือกได้");
          }
          const optionsArray = await response.json();

          // Group options by type (only include available options)
          const groupedOptions: ProductOptions = {};
          optionsArray
            .filter((option: any) => option.is_available !== false)
            .forEach((option: any) => {
              const normalizedPrice =
                typeof option.additional_price === "string"
                  ? parseFloat(option.additional_price)
                  : option.additional_price || 0;

              const optionChoice: OptionChoice = {
                option_id: option.option_id,
                option_name: option.option_name,
                additional_price: normalizedPrice,
                is_available: option.is_available,
              };

              if (!groupedOptions[option.option_type]) {
                groupedOptions[option.option_type] = [];
              }
              groupedOptions[option.option_type].push(optionChoice);
            });

          setOptionsData(groupedOptions);

          // Set all options as unchecked by default
          const initialSelections: SelectedOptions = {};
          // Don't pre-select any options
          for (const key in groupedOptions) {
            const isMultiSelect = key === "ท็อปปิ้งพิเศษ" || key === "topping";
            if (isMultiSelect) {
              initialSelections[key] = []; // Empty array for multi-select
            }
            // Don't set any default selections for radio buttons either
          }
          setSelectedOptions(initialSelections);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOptions();
    }
  }, [isOpen, product.product_id, apiBaseUrl]);

  // Recalculate total price when selections or quantity change
  useEffect(() => {
    if (!optionsData) return;

    let additionalPrice = 0;
    const allChoices = Object.values(optionsData).flat();
    for (const type in selectedOptions) {
      const selection = selectedOptions[type];
      if (Array.isArray(selection)) {
        // Checkboxes
        selection.forEach((id) => {
          const choice = allChoices.find((c) => c.option_id === id);
          if (choice) additionalPrice += choice.additional_price;
        });
      } else {
        // Radio
        const choice = allChoices.find((c) => c.option_id === selection);
        if (choice) additionalPrice += choice.additional_price;
      }
    }

    setTotalPrice((product.price + additionalPrice) * quantity);
  }, [selectedOptions, quantity, product.price, optionsData]);

  const handleOptionChange = (
    type: string,
    choiceId: number,
    isMultiSelect: boolean,
  ) => {
    setSelectedOptions((prev) => {
      // Create a new object to ensure React detects the state change
      const newSelections = { ...prev };

      if (isMultiSelect) {
        // Handle checkboxes (toppings)
        if (!newSelections[type]) {
          newSelections[type] = [];
        }

        const currentSelection = Array.isArray(newSelections[type])
          ? [...newSelections[type]]
          : [];
        const optionIndex = currentSelection.indexOf(choiceId);

        if (optionIndex > -1) {
          // Remove the option if it exists
          currentSelection.splice(optionIndex, 1);

          // If no options left for this type, remove the type
          if (currentSelection.length === 0) {
            delete newSelections[type];
          } else {
            newSelections[type] = currentSelection;
          }
        } else {
          // Add the option if it doesn't exist
          newSelections[type] = [...currentSelection, choiceId];
        }
      } else {
        // Handle radio buttons (sizes, etc.)
        if (newSelections[type] === choiceId) {
          // If clicking the currently selected radio button, unselect it
          delete newSelections[type];
        } else {
          // Otherwise, select the new radio button
          newSelections[type] = choiceId;
        }
      }

      // Return a new object to ensure React detects the state change
      return { ...newSelections };
    });
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const optionIds: number[] = [];
      const optionDetails: Array<{
        option_id: number;
        option_name: string;
        option_type: string;
        additional_price: number;
      }> = [];

      // Collect option IDs and their details
      Object.entries(selectedOptions).forEach(([type, selections]) => {
        if (Array.isArray(selections)) {
          // For multi-select options (like toppings)
          selections.forEach((optionId) => {
            const option = optionsData?.[type]?.find(
              (opt) => opt.option_id === optionId,
            );
            if (option) {
              optionIds.push(optionId);
              optionDetails.push({
                option_id: option.option_id,
                option_name: option.option_name,
                option_type: type,
                additional_price: option.additional_price,
              });
            }
          });
        } else if (selections !== undefined) {
          // For single-select options
          const option = optionsData?.[type]?.find(
            (opt) => opt.option_id === selections,
          );
          if (option) {
            optionIds.push(selections);
            optionDetails.push({
              option_id: option.option_id,
              option_name: option.option_name,
              option_type: type,
              additional_price: option.additional_price,
            });
          }
        }
      });

      await addToCart(product.product_id, quantity, optionDetails);
      onClose(true); // Signal success
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => onClose(false)}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 md:p-8 shadow-2xl flex flex-col"
            initial={{ y: 20, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            style={{ maxHeight: "85vh" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                ปรับแต่ง {product.name}
              </h2>
              <button
                onClick={() => onClose(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              {isLoading && (
                <p className="text-gray-500 text-center py-4">
                  กำลังโหลดตัวเลือก...
                </p>
              )}
              {error && (
                <p className="text-red-500 text-center py-4">
                  เกิดข้อผิดพลาด: {error}
                </p>
              )}
              {!isLoading &&
                !error &&
                (!optionsData || Object.keys(optionsData).length === 0) && (
                  <p className="text-gray-500 text-center py-8">
                    ไม่มีตัวเลือกเพิ่มเติมสำหรับสินค้านี้
                  </p>
                )}
              {optionsData && Object.keys(optionsData).length > 0 && (
                <div className="space-y-6">
                  {Object.entries(optionsData).map(([type, choices]) => {
                    const isMultiSelect =
                      type === "ท็อปปิ้งพิเศษ" || type === "topping";
                    return (
                      <fieldset
                        key={type}
                        className="border-t border-gray-200 pt-4"
                      >
                        <legend className="text-base font-semibold text-gray-800 mb-2">
                          {type}
                        </legend>
                        <div className="mt-4 space-y-3">
                          {choices.map((choice) => {
                            const isSelected = isMultiSelect
                              ? (selectedOptions[type] as number[])?.includes(
                                  choice.option_id,
                                )
                              : selectedOptions[type] === choice.option_id;

                            return (
                              <label
                                key={choice.option_id}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer
                                  ${
                                    isSelected
                                      ? "border-[#b21807] bg-[#fdecec]"
                                      : "border-gray-200 hover:border-[#b21807]"
                                  }`}
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`flex items-center justify-center h-5 w-5 rounded border-2 mr-3 transition-colors
                                    ${
                                      isSelected
                                        ? "bg-[#b21807] border-[#b21807]"
                                        : "border-gray-400"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        className="h-3.5 w-3.5 text-white"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <p className="font-medium text-gray-800">
                                    {choice.option_name}
                                  </p>
                                </div>
                                {choice.additional_price > 0 && (
                                  <span className="text-sm font-medium text-gray-600">
                                    +฿{choice.additional_price.toFixed(0)}
                                  </span>
                                )}
                                <input
                                  type={isMultiSelect ? "checkbox" : "radio"}
                                  checked={isSelected}
                                  onChange={() =>
                                    handleOptionChange(
                                      type,
                                      choice.option_id,
                                      isMultiSelect,
                                    )
                                  }
                                  className="sr-only"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-800">จำนวน</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={decrement}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-lg font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-12 text-center text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={increment}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-lg font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-[#b21807] text-white py-3.5 rounded-xl font-semibold hover:bg-[#9a1506] transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                เพิ่มลงตะกร้า - ฿{totalPrice.toFixed(0)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default ProductCustomizationModal;
