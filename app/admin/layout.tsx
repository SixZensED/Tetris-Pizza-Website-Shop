"use client";

import { useAuthContext } from "@/app/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      // Show error message and redirect to home
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.push("/");
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will be redirected by the auth system
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          กลับ
        </button>
        {children}
      </main>
    </div>
  );
}
