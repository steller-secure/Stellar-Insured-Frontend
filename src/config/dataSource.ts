/**
 * Data Source Configuration
 * 
 * This module manages the separation between mock and production data.
 * It provides a centralized way to switch between data sources based on environment.
 * 
 * IMPORTANT: Mock data should only be used during development.
 * In production, always use real API endpoints.
 */

import { type Policy, type Claim, type Proposal } from '@/types/api';
import { mockDb } from '@/mocks/db';

export type DataSourceType = 'mock' | 'api';

export interface BlockchainDataSourceConfig {
  websocketUrl?: string;
  eventSourceUrl?: string;
  pollingUrl?: string;
  horizonUrl: string;
  sorobanRpcUrl?: string;
  contractIds: string[];
}

export function getBlockchainDataSource(): BlockchainDataSourceConfig {
  return {
    websocketUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_WS_URL,
    eventSourceUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_EVENTS_URL,
    pollingUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_POLL_URL,
    horizonUrl: stellarConfig.horizonUrl,
    sorobanRpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || (stellarConfig.networkId === 'mainnet'
      ? 'https://soroban-rpc.mainnet.stellar.gateway.fm'
      : 'https://soroban-testnet.stellar.org'),
    contractIds: (process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_IDS || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
  };
}

interface DataSourceConfig {
  type: DataSourceType;
  useMockData: boolean;
  apiBaseUrl?: string;
}

/**
 * Determine the active data source based on environment variables and development mode
 */
function getDataSourceConfig(): DataSourceConfig {
  // Get environment - defaults to 'development'
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';
  
  // Explicitly check for production or staging
  const isProduction = env === 'production';
  const isStaging = env === 'staging';
  
  // Use mock data only in development
  const useMockData = !isProduction && !isStaging;
  
  return {
    type: useMockData ? 'mock' : 'api',
    useMockData,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  };
}

/**
 * Get cached configuration
 */
let cachedConfig: DataSourceConfig | null = null;

export function getActiveDataSource(): DataSourceConfig {
  if (!cachedConfig) {
    cachedConfig = getDataSourceConfig();
  }
  return cachedConfig;
}

/**
 * Mock Data Provider - Returns mock data with simulated delay
 * Use this to test loading states in development
 */
export class MockDataProvider {
  static async getPolicies(): Promise<Policy[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDb.getPolicies();
  }

  static async getClaims(): Promise<Claim[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDb.getClaims();
  }

  static async getProposals(): Promise<Proposal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDb.getProposals();
  }

  static async getPolicy(id: string): Promise<Policy | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.getPolicy(id);
  }

  static async getClaim(id: string): Promise<Claim | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.getClaim(id);
  }

  static async getProposal(id: string): Promise<Proposal | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.getProposal(id);
  }

  static async createPolicy(policy: Policy): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockDb.addPolicy(policy);
  }

  static async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.updatePolicy(id, updates);
  }

  static async createClaim(claim: Claim): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockDb.addClaim(claim);
  }

  static async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.updateClaim(id, updates);
  }

  static async createProposal(proposal: Proposal): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockDb.addProposal(proposal);
  }

  static async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.updateProposal(id, updates);
  }
  
  static async deleteProposal(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDb.deleteProposal(id);
  }

  static async getProposals(): Promise<Proposal[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProposals;
  }
}

/**
 * Real API Data Provider - Fetches from actual backend
 * Use this in staging/production environments
 */
export class ApiDataProvider {
  private static baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  static async getPolicies(): Promise<Policy[]> {
    const response = await fetch(`${this.baseUrl}/api/policies`);
    if (!response.ok) throw new Error(`Failed to fetch policies: ${response.statusText}`);
    return response.json();
  }

  static async getClaims(): Promise<Claim[]> {
    const response = await fetch(`${this.baseUrl}/api/claims`);
    if (!response.ok) throw new Error(`Failed to fetch claims: ${response.statusText}`);
    return response.json();
  }

  static async getProposals(): Promise<Proposal[]> {
    const response = await fetch(`${this.baseUrl}/api/proposals`);
    if (!response.ok) throw new Error(`Failed to fetch proposals: ${response.statusText}`);
    return response.json();
  }

  static async getPolicy(id: string): Promise<Policy | undefined> {
    const response = await fetch(`${this.baseUrl}/api/policies/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch policy: ${response.statusText}`);
    return response.json();
  }

  static async getClaim(id: string): Promise<Claim | undefined> {
    const response = await fetch(`${this.baseUrl}/api/claims/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch claim: ${response.statusText}`);
    return response.json();
  }

  static async getProposal(id: string): Promise<Proposal | undefined> {
    const response = await fetch(`${this.baseUrl}/api/proposals/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch proposal: ${response.statusText}`);
    return response.json();
  }

  static async createPolicy(policy: Policy): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    if (!response.ok) throw new Error(`Failed to create policy: ${response.statusText}`);
  }

  static async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy | undefined> {
    const response = await fetch(`${this.baseUrl}/api/policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`Failed to update policy: ${response.statusText}`);
    return response.json();
  }

  static async createClaim(claim: Claim): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim)
    });
    if (!response.ok) throw new Error(`Failed to create claim: ${response.statusText}`);
  }

  static async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | undefined> {
    const response = await fetch(`${this.baseUrl}/api/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`Failed to update claim: ${response.statusText}`);
    return response.json();
  }

  static async createProposal(proposal: Proposal): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposal)
    });
    if (!response.ok) throw new Error(`Failed to create proposal: ${response.statusText}`);
  }

  static async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined> {
    const response = await fetch(`${this.baseUrl}/api/proposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`Failed to update proposal: ${response.statusText}`);
    return response.json();
  }

  static async deleteProposal(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/proposals/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete proposal: ${response.statusText}`);
    return true;
  }
}

/**
 * Unified Data Service - Routes to either mock or API provider
 * Use this in your components instead of direct mockData imports
 */
export class DataService {
  static async getPolicies(): Promise<Policy[]> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.getPolicies() 
      : ApiDataProvider.getPolicies();
  }

  static async getClaims(): Promise<Claim[]> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.getClaims() 
      : ApiDataProvider.getClaims();
  }

  static async getProposals(): Promise<Proposal[]> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.getProposals() 
      : ApiDataProvider.getProposals();
  }

  static async getPolicy(id: string): Promise<Policy | undefined> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.getPolicy(id) 
      : ApiDataProvider.getPolicy(id);
  }

  static async getClaim(id: string): Promise<Claim | undefined> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.getClaim(id) 
      : ApiDataProvider.getClaim(id);
  }

  static async getProposal(id: string): Promise<Proposal | undefined> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.getProposal(id) 
      : ApiDataProvider.getProposal(id);
  }

  static async createPolicy(policy: Policy): Promise<void> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.createPolicy(policy) 
      : ApiDataProvider.createPolicy(policy);
  }

  static async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy | undefined> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.updatePolicy(id, updates) 
      : ApiDataProvider.updatePolicy(id, updates);
  }

  static async createClaim(claim: Claim): Promise<void> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.createClaim(claim) 
      : ApiDataProvider.createClaim(claim);
  }

  static async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | undefined> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.updateClaim(id, updates) 
      : ApiDataProvider.updateClaim(id, updates);
  }

  static async createProposal(proposal: Proposal): Promise<void> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.createProposal(proposal) 
      : ApiDataProvider.createProposal(proposal);
  }

  static async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | undefined> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.updateProposal(id, updates) 
      : ApiDataProvider.updateProposal(id, updates);
  }

  static async deleteProposal(id: string): Promise<boolean> {
    return getActiveDataSource().useMockData 
      ? MockDataProvider.deleteProposal(id) 
      : ApiDataProvider.deleteProposal(id);
  }

  static async getProposals(): Promise<Proposal[]> {
    const config = getActiveDataSource();
    return config.useMockData
      ? MockDataProvider.getProposals()
      : ApiDataProvider.getProposals();
  }
}

/**
 * For development debugging: Get information about current data source
 */
export function getDataSourceInfo(): Record<string, unknown> {
  const config = getActiveDataSource();
  return {
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    dataSource: config.type,
    useMockData: config.useMockData,
    apiBaseUrl: config.apiBaseUrl,
    message: config.useMockData 
      ? '⚠️  Using MOCK data - this is for development only!'
      : '✓ Using REAL API data',
  };
}
