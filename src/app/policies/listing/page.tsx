import React, { Suspense } from "react";
import { Inter } from "next/font/google";
import { PolicyListingScreen } from "@/components/policies/listing/PolicyListingScreen";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function PoliciesListingPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#101935] flex justify-center`}>
      <Suspense fallback={<div>Loading...</div>}>
        <PolicyListingScreen />
      </Suspense>
    </div>
  );
}
