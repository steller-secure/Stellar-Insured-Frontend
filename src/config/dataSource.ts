/**
 * Data Source Configuration
 * 
 * This module manages the separation between mock and production data.
 * It provides a centralized way to switch between data sources based on environment.
 * 
 * IMPORTANT: Mock data should only be used during development.
 * In production, always use real API endpoints.
 */

import { mockPolicies, mockClaims, type Policy, type Claim } from '@/data/mockData';

export type DataSourceType = 'mock' | 'api';

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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPolicies;
  }

  static async getClaims(): Promise<Claim[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockClaims;
  }

  static async getPolicy(id: string): Promise<Policy | undefined> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPolicies.find(p => p.id === id);
  }

  static async getClaim(id: string): Promise<Claim | undefined> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClaims.find(c => c.id === id);
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
}

/**
 * Unified Data Service - Routes to either mock or API provider
 * Use this in your components instead of direct mockData imports
 */
export class DataService {
  static async getPolicies(): Promise<Policy[]> {
    const config = getActiveDataSource();
    if (config.useMockData) {
      return MockDataProvider.getPolicies();
    }
    return ApiDataProvider.getPolicies();
  }

  static async getClaims(): Promise<Claim[]> {
    const config = getActiveDataSource();
    if (config.useMockData) {
      return MockDataProvider.getClaims();
    }
    return ApiDataProvider.getClaims();
  }

  static async getPolicy(id: string): Promise<Policy | undefined> {
    const config = getActiveDataSource();
    if (config.useMockData) {
      return MockDataProvider.getPolicy(id);
    }
    return ApiDataProvider.getPolicy(id);
  }

  static async getClaim(id: string): Promise<Claim | undefined> {
    const config = getActiveDataSource();
    if (config.useMockData) {
      return MockDataProvider.getClaim(id);
    }
    return ApiDataProvider.getClaim(id);
  }
}

/**
 * For development debugging: Get information about current data source
 */
export function getDataSourceInfo(): Record<string, any> {
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
