export interface Policy {
  id: string;
  name: string;
  type: 'Health' | 'Auto' | 'Home' | 'Travel';
  coverageLimit: number;
  coverageLimitFormatted: string;
  policyNumber: string;
}

export interface Claim {
  id: string;
  policyId: string;
  policyName: string;
  incidentType: string; // e.g., "Wallet Hack", "Car Accident"
  amount: number;
  amountFormatted: string;
  dateFiled: string;
  status: 'Active' | 'Pending' | 'Approved' | 'Rejected';
  description: string;
}

export const mockPolicies: Policy[] = [
  {
    id: 'p1',
    name: 'Comprehensive Health Plan',
    type: 'Health',
    coverageLimit: 50000,
    coverageLimitFormatted: '$50,000',
    policyNumber: 'HEL-9928-XJ',
  },
  {
    id: 'p2',
    name: 'Standard Auto Insurance',
    type: 'Auto',
    coverageLimit: 25000,
    coverageLimitFormatted: '$25,000',
    policyNumber: 'AUT-5521-MK',
  },
  {
    id: 'p3',
    name: 'Home Sweet Home Protection',
    type: 'Home',
    coverageLimit: 500000,
    coverageLimitFormatted: '$500,000',
    policyNumber: 'HOM-1102-PP',
  },
];

export const mockClaims: Claim[] = [
  {
    id: 'CLM-2025-001',
    policyId: 'p1',
    policyName: 'Wallet Hack Compensation',
    incidentType: 'Wallet Hack Compensation',
    amount: 12500,
    amountFormatted: '$12,500',
    dateFiled: 'Apr 2, 2025',
    status: 'Active',
    description: 'Compensation for assets lost during exchange security breach',
  },
  {
    id: 'CLM-2025-002',
    policyId: 'p2',
    policyName: 'Smart Contract Claim',
    incidentType: 'Smart Contract Claim',
    amount: 8000,
    amountFormatted: '$8,000',
    dateFiled: 'Apr 15, 2025',
    status: 'Pending',
    description: 'Claim for losses due to smart contract vulnerability exploit',
  },
  {
    id: 'CLM-2025-003',
    policyId: 'p3',
    policyName: 'DeFi Protocol Hack',
    incidentType: 'DeFi Protocol Hack',
    amount: 15000,
    amountFormatted: '$15,000',
    dateFiled: 'Mar 28, 2025',
    status: 'Rejected',
    description: 'Compensation request for DeFi protocol security incident',
  },
];
