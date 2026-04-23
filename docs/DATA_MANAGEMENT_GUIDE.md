/**
 * DATA MANAGEMENT & LOADING STATES - IMPLEMENTATION GUIDE
 * 
 * This document explains the new data management system, loading state patterns,
 * and environment switching capabilities implemented across the Stellar Insured frontend.
 * 
 * ==============================================================================
 * TABLE OF CONTENTS
 * ==============================================================================
 * 
 * 1. Data Source Management
 * 2. Using the DataService
 * 3. Loading States with useDataFetch Hook
 * 4. Environment Configuration
 * 5. Migration Guide for Existing Components
 * 6. Best Practices
 * 
 * ==============================================================================
 * 1. DATA SOURCE MANAGEMENT
 * ==============================================================================
 * 
 * The new data source system provides automatic switching between mock data
 * (development) and real API endpoints (production/staging).
 * 
 * Key Files:
 * - src/config/dataSource.ts - Main data configuration and providers
 * - src/hooks/useDataFetch.ts - React hooks for data fetching with loading states
 * - src/components/ui/SkeletonLoaders.tsx - Reusable skeleton loading components
 * 
 * 
 * ==============================================================================
 * 2. USING THE DATASERVICE
 * ==============================================================================
 * 
 * The DataService routes requests to the appropriate provider based on environment:
 * 
 * ```typescript
 * import { DataService } from '@/config/dataSource';
 * 
 * // Automatically uses mock data in development, real API in production
 * const policies = await DataService.getPolicies();
 * const claims = await DataService.getClaims();
 * const policy = await DataService.getPolicy(policyId);
 * const claim = await DataService.getClaim(claimId);
 * ```
 * 
 * For debugging, check the active data source:
 * ```typescript
 * import { getDataSourceInfo } from '@/config/dataSource';
 * console.log(getDataSourceInfo());
 * // Output:
 * // {
 * //   environment: 'development',
 * //   dataSource: 'mock',
 * //   useMockData: true,
 * //   message: '⚠️  Using MOCK data - this is for development only!'
 * // }
 * ```
 * 
 * 
 * ==============================================================================
 * 3. LOADING STATES WITH useDataFetch HOOK
 * ==============================================================================
 * 
 * The useDataFetch hook handles data fetching with automatic loading states:
 * 
 * A. BASIC USAGE (List Data)
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * For fetching list of items:
 * 
 * ```typescript
 * 'use client';
 * import { useDataFetchList } from '@/hooks/useDataFetch';
 * import { DataService } from '@/config/dataSource';
 * import { ClaimsSkeleton, EmptyState, ErrorState } from '@/components/ui/SkeletonLoaders';
 * 
 * export function MyClaimsComponent() {
 *   const { items, loading, error, refetch } = useDataFetchList(
 *     () => DataService.getClaims(),
 *     { cacheDuration: 5 * 60 * 1000 } // Cache for 5 minutes
 *   );
 * 
 *   if (loading) return <ClaimsSkeleton />;
 *   if (error) return <ErrorState onRetry={refetch} />;
 *   if (items.length === 0) return <EmptyState />;
 * 
 *   return <div>{items.map(item => ...)}</div>;
 * }
 * ```
 * 
 * B. SINGLE ITEM FETCHING
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * For fetching a single item by ID:
 * 
 * ```typescript
 * const { item, loading, error, notFound } = useDataFetchOne(
 *   () => DataService.getPolicy(policyId),
 *   { cacheDuration: 10 * 60 * 1000 }
 * );
 * ```
 * 
 * C. DEPENDENCY-BASED FETCHING
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * When data depends on parameters that can change:
 * 
 * ```typescript
 * const { data, loading, error, refetch } = useDataFetchDependency(
 *   async (deps) => {
 *     const [userId] = deps;
 *     return DataService.getClaims(); // Filter by userId
 *   },
 *   [userId]
 * );
 * ```
 * 
 * D. HOOK OPTIONS
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * ```typescript
 * useDataFetch(fetchFunction, {
 *   cacheDuration: 5 * 60 * 1000,  // Auto-reload after 5 minutes (default)
 *   autoFetch: true,                 // Fetch on mount (default)
 *   onSuccess: (data) => {},         // Callback when fetch succeeds
 *   onError: (error) => {},          // Callback when fetch fails
 * })
 * ```
 * 
 * 
 * ==============================================================================
 * 4. SKELETON LOADING COMPONENTS
 * ==============================================================================
 * 
 * Pre-built skeleton loaders for different component types:
 * 
 * ```typescript
 * import {
 *   SkeletonPulse,
 *   PolicyCardSkeleton,
 *   ClaimsSkeleton,
 *   TableSkeleton,
 *   DashboardCardSkeleton,
 *   FormSkeleton,
 *   LoadingState,
 *   EmptyState,
 *   ErrorState,
 * } from '@/components/ui/SkeletonLoaders';
 * 
 * // Show loading state
 * {loading && <ClaimsSkeleton />}
 * 
 * // Show error with retry button
 * {error && <ErrorState onRetry={refetch} />}
 * 
 * // Show empty state
 * {items.length === 0 && <EmptyState title="No claims" />}
 * 
 * // Generic loading spinner
 * <LoadingState message="Processing your request..." size="lg" />
 * ```
 * 
 * 
 * ==============================================================================
 * 5. ENVIRONMENT CONFIGURATION
 * ==============================================================================
 * 
 * A. ENVIRONMENT VARIABLES
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Create .env.local (development) or .env.production (production):
 * 
 * DEVELOPMENT (.env.local):
 * ```
 * NEXT_PUBLIC_APP_ENV=development
 * NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
 * ```
 * 
 * PRODUCTION (.env.production):
 * ```
 * NEXT_PUBLIC_APP_ENV=production
 * NEXT_PUBLIC_API_BASE_URL=https://api.stellar-insured.com
 * ```
 * 
 * STAGING (.env.staging):
 * ```
 * NEXT_PUBLIC_APP_ENV=staging
 * NEXT_PUBLIC_API_BASE_URL=https://staging-api.stellar-insured.com
 * ```
 * 
 * B. DATA SOURCE SELECTION LOGIC
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * - development → Uses MOCK data
 * - staging → Uses REAL API
 * - production → Uses REAL API
 * 
 * This ensures you always use real data in staging/production.
 * 
 * 
 * ==============================================================================
 * 6. MIGRATION GUIDE FOR EXISTING COMPONENTS
 * ==============================================================================
 * 
 * OLD WAY (Direct mock data import):
 * ```typescript
 * import { mockClaims } from '@/data/mockData';
 * 
 * export function ClaimsList() {
 *   return (
 *     <div>
 *       {mockClaims.map(claim => (
 *         <div key={claim.id}>{claim.id}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * NEW WAY (With loading states and data service):
 * ```typescript
 * 'use client';
 * import { useDataFetchList } from '@/hooks/useDataFetch';
 * import { DataService } from '@/config/dataSource';
 * import { ClaimsSkeleton, EmptyState, ErrorState } from '@/components/ui/SkeletonLoaders';
 * 
 * export function ClaimsList() {
 *   const { items: claims, loading, error, refetch } = useDataFetchList(
 *     () => DataService.getClaims(),
 *     { cacheDuration: 5 * 60 * 1000 }
 *   );
 * 
 *   if (loading) return <ClaimsSkeleton />;
 *   if (error) return <ErrorState onRetry={refetch} />;
 *   if (claims.length === 0) return <EmptyState />;
 * 
 *   return (
 *     <div>
 *       {claims.map(claim => (
 *         <div key={claim.id}>{claim.id}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Migration Checklist:
 * ✅ Replace mockData imports with DataService
 * ✅ Use useDataFetchList/useDataFetchOne hook
 * ✅ Add loading state UI (show skeleton)
 * ✅ Add error state UI (show error message + retry)
 * ✅ Add empty state UI (show empty message)
 * ✅ Set appropriate cache duration
 * 
 * 
 * ==============================================================================
 * 7. BEST PRACTICES
 * ==============================================================================
 * 
 * A. CACHING STRATEGY
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * - Short-lived data (user preferences): 1-2 minutes
 * - Stable data (policy list): 5-10 minutes
 * - Static data (lookup tables): 30 minutes
 * - Set to 0 to disable caching
 * 
 * Example:
 * ```typescript
 * // Cache policy list for 10 minutes
 * const { items: policies } = useDataFetchList(
 *   () => DataService.getPolicies(),
 *   { cacheDuration: 10 * 60 * 1000 }
 * );
 * ```
 * 
 * B. ERROR HANDLING
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Always provide error state with retry capability:
 * 
 * ```typescript
 * {error && (
 *   <ErrorState 
 *     title="Failed to load claims"
 *     description={error.message}
 *     onRetry={refetch}
 *   />
 * )}
 * ```
 * 
 * C. CLEARING CACHE
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Clear cache on logout or when data needs to be refreshed:
 * 
 * ```typescript
 * import { clearDataCache } from '@/hooks/useDataFetch';
 * 
 * const handleLogout = () => {
 *   clearDataCache(); // Clear all cached data
 *   router.push('/signin');
 * };
 * ```
 * 
 * D. REAL API IMPLEMENTATION
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * When implementing real API endpoints in production, update ApiDataProvider:
 * 
 * ```typescript
 * export class ApiDataProvider {
 *   private static baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
 * 
 *   static async getPolicies(): Promise<Policy[]> {
 *     const response = await fetch(`${this.baseUrl}/api/v1/policies`, {
 *       headers: {
 *         'Authorization': `Bearer ${getAuthToken()}`,
 *         'Content-Type': 'application/json',
 *       }
 *     });
 *     if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *     return response.json();
 *   }
 * }
 * ```
 * 
 * E. DEBUGGING
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Check current data source in browser console:
 * 
 * ```javascript
 * // In browser console
 * import { getDataSourceInfo } from '@/config/dataSource';
 * console.log(getDataSourceInfo());
 * ```
 * 
 * Or in code:
 * ```typescript
 * import { getActiveDataSource } from '@/config/dataSource';
 * console.log('Current data source:', getActiveDataSource());
 * ```
 * 
 * 
 * ==============================================================================
 * FILES UPDATED
 * ==============================================================================
 * 
 * New Files Created:
 * ✅ src/config/dataSource.ts - Data source configuration and providers
 * ✅ src/hooks/useDataFetch.ts - Data fetching hooks
 * ✅ src/components/ui/SkeletonLoaders.tsx - Skeleton components
 * 
 * Components Updated with Loading States:
 * ✅ src/components/claims/ClaimTrackingDashboard.tsx
 * ✅ src/components/claims/ClaimForm.tsx
 * ✅ src/components/claims/steps/ClaimAmountStep.tsx
 * ✅ src/components/claims/steps/ReviewSubmitStep.tsx
 * ✅ src/app/policies/[id]/page.tsx
 * 
 * 
 * ==============================================================================
 * TROUBLESHOOTING
 * ==============================================================================
 * 
 * Q: Why is my component still showing blank screen during loading?
 * A: Make sure to render a loading state component when loading is true.
 *    Use SkeletonLoaders like <ClaimsSkeleton /> or <LoadingState />
 * 
 * Q: How do I force refresh the data?
 * A: Call the refetch function returned by the hook:
 *    const { data, refetch } = useDataFetchList(...);
 *    refetch(); // Forces fresh fetch
 * 
 * Q: Why is production still using mock data?
 * A: Check that NEXT_PUBLIC_APP_ENV is set to 'production' in production build.
 *    Use console.log(getDataSourceInfo()) to verify.
 * 
 * Q: Can I mix mock and real data for different endpoints?
 * A: Yes! The environment check is in DataService.getClaims(), etc.
 *    You can customize the logic for specific endpoints.
 * 
 * ==============================================================================
 */
