"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  id?: string;
  value?: string; // ISO: YYYY-MM-DD
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
};

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder = "วว/ดด/ปปปป",
  className,
  minYear = 1900,
  maxYear,
}: Props) {
  const today = new Date();
  const maxY = maxYear ?? today.getFullYear();

  const selected = useMemo(() => (value ? parseISO(value) : null), [value]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected ?? today);
  const [pickerMode, setPickerMode] = useState<"date" | "year">("date");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const yearGridRef = useRef<HTMLDivElement | null>(null);
  const selectedYearRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (selected) setView(selected);
  }, [selected]);

  useEffect(() => {
    if (open) {
      setPickerMode("date"); // Reset to date view when opening
    }
  }, [open]);

  useEffect(() => {
    if (
      pickerMode === "year" &&
      yearGridRef.current &&
      selectedYearRef.current
    ) {
      selectedYearRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [pickerMode]);

  const display = value ? formatDisplay(value) : "";

  const grid = useMemo(() => buildMonthGrid(view), [view]);

  const monthLabel = thaiMonth(view.getMonth()) + " " + view.getFullYear();

  const handlePick = (d: Date) => {
    const y = d.getFullYear();
    if (y < minYear || y > maxY) return;
    onChange(toISO(d));
    setOpen(false);
  };

  const years = useMemo(() => {
    const ys = [];
    for (let y = maxY; y >= minYear; y--) {
      ys.push(y);
    }
    return ys;
  }, [minYear, maxY]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-lg border px-4 py-3 text-left text-[15px] bg-white ring-0 outline-none focus:ring-2 focus:ring-neutral-300 border-neutral-300 hover:border-neutral-400"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={display ? "text-neutral-900" : "text-neutral-400"}>
          {display || placeholder}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute z-50 mt-1 w-[300px] rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg"
            role="dialog"
            aria-label="เลือกวันที่"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (pickerMode === "year") {
                    setView(new Date(view.getFullYear() - 10, 1));
                  } else {
                    setView(addMonths(view, -1));
                  }
                }}
                className="rounded-full p-2 hover:bg-neutral-100"
                aria-label={
                  pickerMode === "year" ? "10 ปีก่อนหน้า" : "เดือนก่อนหน้า"
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  setPickerMode(pickerMode === "date" ? "year" : "date")
                }
                className="rounded-md px-3 py-1 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                {pickerMode === "year" ? view.getFullYear() : monthLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pickerMode === "year") {
                    setView(new Date(view.getFullYear() + 10, 1));
                  } else {
                    setView(addMonths(view, 1));
                  }
                }}
                className="rounded-full p-2 hover:bg-neutral-100"
                aria-label={pickerMode === "year" ? "10 ปีถัดไป" : "เดือนถัดไป"}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <AnimatePresence mode="out-in">
              {pickerMode === "year" ? (
                <motion.div
                  key="year"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  ref={yearGridRef}
                  className="grid max-h-[240px] grid-cols-4 gap-1 overflow-y-auto"
                >
                  {years.map((y) => (
                    <button
                      key={y}
                      ref={y === view.getFullYear() ? selectedYearRef : null}
                      type="button"
                      onClick={() => {
                        setView(new Date(y, view.getMonth(), 1));
                        setPickerMode("date");
                      }}
                      className={`rounded-lg py-2 text-center text-sm transition-colors ${
                        y === view.getFullYear()
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="grid grid-cols-7 gap-1 text-center text-[12px] text-neutral-500 mb-1">
                    {weekdaysTH.map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {grid.map((day, i) => {
                      const isOther = day.getMonth() !== view.getMonth();
                      const isSel = selected && sameDate(day, selected);
                      const isToday = sameDate(day, today);
                      const disabled =
                        day.getFullYear() < minYear || day.getFullYear() > maxY;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handlePick(day)}
                          disabled={disabled}
                          className={`h-9 rounded-lg text-sm transition-colors ${
                            isSel
                              ? "bg-neutral-900 text-white"
                              : isOther
                                ? "text-neutral-400 hover:bg-neutral-100"
                                : "text-neutral-800 hover:bg-neutral-100"
                          } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${
                            isToday && !isSel ? "ring-1 ring-neutral-300" : ""
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-2 flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-neutral-600 hover:underline"
                onClick={() => onChange("")}
              >
                ล้างค่า
              </button>
              <button
                type="button"
                className="text-neutral-800 font-medium hover:underline"
                onClick={() => {
                  onChange(toISO(today));
                  setView(today);
                  setOpen(false);
                }}
              >
                วันนี้
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Utils ---------- */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function sameDate(a: Date, b: Date | null): boolean {
  if (!b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(view: Date): Date[] {
  const first = startOfMonth(view);
  const firstDay = first.getDay(); // 0 = Sun
  const start = new Date(first);
  start.setDate(first.getDate() - firstDay);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const weekdaysTH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const thaiMonth = (i: number) => thaiMonths[i] ?? "";
