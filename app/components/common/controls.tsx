"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

type CheckboxProps = PropsWithChildren<{
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  className?: string;
}>;

export function Checkbox({ id, checked, onChange, onBlur, className, children }: CheckboxProps) {
  return (
    <label className={`group inline-flex items-start gap-3 cursor-pointer select-none ${className ?? ""}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onBlur={onBlur}
      />
      <span
        aria-hidden
        className="relative mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-md border border-neutral-400 bg-white peer-checked:border-neutral-900 transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-300"
      >
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-neutral-900"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </span>
      <div className="text-sm leading-6 text-neutral-800">{children}</div>
    </label>
  );
}

type RadioProps = PropsWithChildren<{
  id?: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  onBlur?: () => void;
  className?: string;
}>;

export function Radio({ id, name, value, checked, onChange, onBlur, className, children }: RadioProps) {
  return (
    <label className={`group inline-flex items-center gap-2 cursor-pointer select-none ${className ?? ""}`} htmlFor={id}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
      />
      <span
        aria-hidden
        className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full border border-neutral-400 bg-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-300"
      >
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-[#b21807]"
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 360,}}
        />
      </span>
      <span className="text-sm text-neutral-800">{children}</span>
    </label>
  );
}

