"use client";

import { useLoading } from "@/contexts/LoadingContext";

export default function GlobalLoader() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
    </div>
  );
}