"use client";

import React, { useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  // Effect to handle body scrolling when modal is open/closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  // Close the modal when the backdrop is clicked, but not the content inside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      // Using a fixed position to cover the entire viewport
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg p-6 m-4 bg-white rounded-xl shadow-lg transform transition-transform scale-100">

        {/* Close button positioned at the top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Optional Title */}
        {title && (
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
            {title}
          </h2>
        )}

        {/* Modal content is passed via children */}
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
