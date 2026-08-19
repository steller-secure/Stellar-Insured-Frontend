"use client";

import Image from "next/image";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className=" border border-[#94BCCA] rounded-lg p-6 hover:bg-slate-800/70 transition-colors duration-300">
      <div className="mb-4">
        <Image
          src={icon}
          alt={`${title} icon`}
          width={26}
          height={26}
          className="w-[26px] h-[26px] object-contain"
        />
      </div>
      <h3 className="text-white font-bold text-xl leading-none  font-display mb-3">
        {title}
      </h3>
      <p className="text-slate-300 font-bold text-[15px] leading-relaxed font-display">
        {description}
      </p>
    </div>
  );
};

const KeyFeaturesSection = () => {
  const features = [
    {
      icon: "/keyfeatureicons/file-text.png",
      title: "Smart Contract-Based Policies",
      description: "Insurance policies created and managed through self-executing smart contracts, ensuring fairness and transparency."
    },
    {
      icon: "/keyfeatureicons/clock-4.png",
      title: "Automated Claim Settlements",
      description: "Claims processed automatically based on predefined criteria, reducing the need for manual intervention."
    },
    {
      icon: "/keyfeatureicons/users.png",
      title: "Decentralized Risk Pools",
      description: "Users contribute funds to decentralized insurance pools with payouts based on community governance."
    },
    {
      icon: "/keyfeatureicons/shield.png",
      title: "Fraud Prevention & Transparency",
      description: "Every transaction is recorded on the blockchain, ensuring an immutable audit trail for all activities."
    },
    {
      icon: "/keyfeatureicons/database.png",
      title: "Multi-Asset Coverage",
      description: "Support for various insurance categories including health, travel, vehicle, property, and crypto-assets."
    },
    {
      icon: "/keyfeatureicons/vote.png",
      title: "Community-Driven Governance",
      description: "Policyholders vote on key decisions using a DAO model for truly decentralized management."
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#101935]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#080D24] mb-6">
            Key Features
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-slate-300 font-bold text-xl leading-relaxed text-center font-display">
              Stellar Insured leverages blockchain technology to provide innovative insurance solutions that are transparent, efficient, and user-centric.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;