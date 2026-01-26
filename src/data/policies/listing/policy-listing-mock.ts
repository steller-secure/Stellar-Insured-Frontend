import { PolicyCategory } from "@/types/policies/policy-listing";

export const POLICY_CATEGORIES_MOCK: PolicyCategory[] = [
  {
    id: "health",
    title: "Health Insurance",
    description:
      "Protect yourself with blockchain-based health coverage that ensures transparent claims and instant payouts",
    icon: "heart",
  },
  {
    id: "vehicle",
    title: "Vehicle Insurance",
    description:
      "Comprehensive coverage for your vehicles with automated claim processing powered by smart contracts.",
    icon: "car",
  },
  {
    id: "property",
    title: "Property Insurance",
    description:
      "Secure your property with tamper-proof policies that provide reliable protection and fast settlements.",
    icon: "home",
  },
  {
    id: "travel",
    title: "Travel Insurance",
    description:
      "Worry-free travel with instant coverage and automated payouts for delayed flights and other travel issues.",
    icon: "globe",
  },
  {
    id: "crypto",
    title: "Crypto-Asset Insurance",
    description:
      "Protect your digital assets, wallets, and NFTs against hacks, theft, and other crypto-specific risks.",
    icon: "database",
  },
];
