// app/components/ui/LoadingSpinner.tsx
'use client';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-500"></div>
    </div>
  );
};

export default LoadingSpinner;
