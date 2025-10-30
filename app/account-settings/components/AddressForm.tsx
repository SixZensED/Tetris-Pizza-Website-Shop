"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiBriefcase,
  FiMapPin,
  FiSave,
  FiLoader,
  FiX,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import GoogleMapWrapper from "./GoogleMapWrapper";

interface AddressFormData {
  address_id?: number;
  address_line1: string;
  sub_district: string;
  city: string;
  province: string;
  postal_code: string;
  recipient_name: string;
  phone_number: string;
  address_label: string;
  is_default: boolean;
}

const THAI_PROVINCES = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พะเยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยโสธร",
  "ยะลา",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
].sort();

interface Props {
  address?: AddressFormData;
  onClose: () => void;
  onSuccess: (action: "create" | "update") => void;
}

export default function AddressForm({ address, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(
    null,
  );
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const isEditing = !!address;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [formData, setFormData] = useState<AddressFormData>({
    address_id: undefined,
    address_line1: "",
    sub_district: "",
    city: "",
    province: "",
    postal_code: "",
    recipient_name: "",
    phone_number: "",
    address_label: "บ้าน",
    is_default: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        address_id: address.address_id,
        address_line1: address.address_line1 || "",
        sub_district: address.sub_district || "",
        city: address.city || "",
        province: address.province || "",
        postal_code: address.postal_code || "",
        recipient_name: address.recipient_name || "",
        phone_number: address.phone_number || "",
        address_label: address.address_label || "บ้าน",
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // 1. เรียก API เพื่อขอข้อมูลผู้ใช้
      const meResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!meResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }

      const userData = await meResponse.json();
      const userId = userData.userId; // ใช้ userId ตามที่ API ส่งกลับมา

      if (!userId) {
        throw new Error("ไม่พบรหัสผู้ใช้");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = isEditing
        ? `${apiBaseUrl}/api/addresses/${formData.address_id}`
        : `${apiBaseUrl}/api/addresses`;

      const requestBody = {
        ...formData,
        user_id: userId,
      };

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "บันทึกที่อยู่ไม่สำเร็จ");
      }

      onSuccess(isEditing ? "update" : "create");
      onClose();
    } catch (err) {
      console.error("Error saving address:", err);
      alert(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกที่อยู่",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelOptions = [
    { label: "บ้าน", icon: <FiHome /> },
    { label: "ที่ทำงาน", icon: <FiBriefcase /> },
    { label: "อื่นๆ", icon: <FiMapPin /> },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-100/60 backdrop-blur-[2px] z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-neutral-200/70 p-8 md:p-10"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-neutral-200/60 pb-3">
          <h2 className="text-2xl font-black text-neutral-900">
            {isEditing ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 transition-colors"
            aria-label="ปิด"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {isLoaded && (
          <>
            <GoogleMapWrapper
              center={mapCenter}
              onPlaceSelect={(place) => {
                const addressComponents = place.address_components;
                if (addressComponents) {
                  const getAddressComponent = (type) => {
                    const component = addressComponents.find((c) =>
                      c.types.includes(type),
                    );
                    return component ? component.long_name : "";
                  };

                  const streetNumber = getAddressComponent("street_number");
                  const route = getAddressComponent("route");

                  setFormData((prev) => ({
                    ...prev,
                    address_line1: `${route} ${streetNumber}`.trim(),
                    sub_district:
                      getAddressComponent("sublocality_level_2") ||
                      getAddressComponent("sublocality_level_1"),
                    city: getAddressComponent("locality"),
                    province: getAddressComponent(
                      "administrative_area_level_1",
                    ),
                    postal_code: getAddressComponent("postal_code"),
                  }));

                  if (place.geometry && place.geometry.location) {
                    setMapCenter(place.geometry.location.toJSON());
                  }
                }
              }}
            />
            <Autocomplete
              onLoad={(autocompleteInstance) =>
                setAutocomplete(autocompleteInstance)
              }
              onPlaceChanged={() => {
                if (autocomplete !== null) {
                  const place = autocomplete.getPlace();
                  const addressComponents = place.address_components;
                  if (addressComponents) {
                    const getAddressComponent = (type) => {
                      const component = addressComponents.find((c) =>
                        c.types.includes(type),
                      );
                      return component ? component.long_name : "";
                    };

                    const streetNumber = getAddressComponent("street_number");
                    const route = getAddressComponent("route");

                    setFormData((prev) => ({
                      ...prev,
                      address_line1: `${route} ${streetNumber}`.trim(),
                      sub_district:
                        getAddressComponent("sublocality_level_2") ||
                        getAddressComponent("sublocality_level_1"),
                      city: getAddressComponent("locality"),
                      province: getAddressComponent(
                        "administrative_area_level_1",
                      ),
                      postal_code: getAddressComponent("postal_code"),
                    }));

                    if (place.geometry && place.geometry.location) {
                      setMapCenter(place.geometry.location.toJSON());
                    }
                  }
                }
              }}
            >
              <input
                type="text"
                placeholder="ค้นหาที่อยู่"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
              />
            </Autocomplete>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address Type Toggle */}
          <div className="flex justify-between bg-neutral-100 rounded-xl p-1">
            {labelOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, address_label: opt.label }))
                }
                className={`flex items-center justify-center w-1/3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.address_label === opt.label
                    ? "bg-[#b21807] text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {opt.icon}
                <span className="ml-2">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Input fields */}
          <div className="grid grid-cols-1 gap-4">
            <input
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              placeholder="ชื่อผู้รับ"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
              required
            />

            <input
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
              maxLength={10}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
              required
            />

            <textarea
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              placeholder="ที่อยู่ (บ้านเลขที่ / หมู่บ้าน / ถนน)"
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none resize-none"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="sub_district"
                value={formData.sub_district}
                onChange={handleChange}
                placeholder="ตำบล/แขวง"
                className="rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
                required
              />
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="อำเภอ/เขต"
                className="rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                list="provinces"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="จังหวัด"
                className="rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
                required
              />
              <datalist id="provinces">
                {THAI_PROVINCES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>

              <input
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="รหัสไปรษณีย์"
                maxLength={5}
                className="rounded-lg border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800 placeholder-neutral-400 shadow-sm focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 outline-none"
                required
              />
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 ${formData.is_default ? "border-[#b21807] bg-[#b21807]" : "border-neutral-400"}`}
                >
                  {formData.is_default && (
                    <svg
                      className="w-full h-full text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-neutral-700">
                ตั้งเป็นที่อยู่หลัก
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition"
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
              className={`rounded-full px-8 py-2.5 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-[#b21807] hover:bg-[#8e1005]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>{isEditing ? "อัปเดตที่อยู่" : "บันทึกที่อยู่"}</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
