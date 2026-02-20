export type CoverageType =
  | "health"
  | "vehicle"
  | "property"
  | "travel"
  | "crypto"
  | "life"
  | "dental"
  | "vision";

export type ProviderId =
  | "stellar-protect"
  | "blockchain-insure"
  | "crypto-shield"
  | "defi-guard"
  | "dao-cover";

export interface PolicyFilterState {
  searchQuery: string;
  coverageTypes: CoverageType[];
  providers: ProviderId[];
  premiumRange: {
    min: number;
    max: number;
  };
  deductibleRange: {
    min: number;
    max: number;
  };
}

export interface FilterCount {
  coverageType: Record<CoverageType, number>;
  provider: Record<ProviderId, number>;
}

export const DEFAULT_FILTER_STATE: PolicyFilterState = {
  searchQuery: "",
  coverageTypes: [],
  providers: [],
  premiumRange: {
    min: 0,
    max: 1000,
  },
  deductibleRange: {
    min: 0,
    max: 10000,
  },
};

export const COVERAGE_TYPE_LABELS: Record<CoverageType, string> = {
  health: "Health",
  vehicle: "Vehicle",
  property: "Property",
  travel: "Travel",
  crypto: "Crypto",
  life: "Life",
  dental: "Dental",
  vision: "Vision",
};

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  "stellar-protect": "Stellar Protect",
  "blockchain-insure": "Blockchain Insure",
  "crypto-shield": "Crypto Shield",
  "defi-guard": "DeFi Guard",
  "dao-cover": "DAO Cover",
};

export const ALL_COVERAGE_TYPES: CoverageType[] = [
  "health",
  "vehicle",
  "property",
  "travel",
  "crypto",
  "life",
  "dental",
  "vision",
];

export const ALL_PROVIDERS: ProviderId[] = [
  "stellar-protect",
  "blockchain-insure",
  "crypto-shield",
  "defi-guard",
  "dao-cover",
];
