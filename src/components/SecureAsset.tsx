import React from "react";
import Image from "next/image";

function SecureAsset() {
  return (
    <div className="bg-[#101935] flex items-center justify-center p-6">

      <div className="mt-6 mb-6">
        {/* Text-section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl sm:text-3xl md:text-5xl font-bold text-[#22BBF9] mb-4 text-center">
            Secure Your Digital Assets
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-6  text-center max-w-xl mx-auto">
            Our shield technology provides unmatched security for your
            blockchain investments, with tamper-proof smart contracts and
            decentralized risk management.
          </p>

          {/* Image-section */}
          <div className="flex-1 flex justify-center mt-6">
            <Image
              src="/secureAsset-image/secure-asset.jpg"
              alt="Secure Asset"
              width={250}
              height={100}
              className="w-full max-w-75 sm:max-w-75 md:max-w-100 h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecureAsset;
