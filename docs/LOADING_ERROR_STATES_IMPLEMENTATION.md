# Loading and Error States Implementation Guide

## Overview

This document outlines the comprehensive implementation of consistent loading and error states across the Stellar Insured Frontend application. All data-fetching components now follow a unified pattern for loading skeletons, error handling, and empty states.

## Design Principles

### 1. **Consistent UX**
- All loading states use skeleton loaders that match the structure of the actual content
- Error states provide clear messages and retry functionality
- Empty states guide users with helpful context

### 2. **Visual Feedback**
- Loading indicators provide immediate feedback
- Error states are clearly distinguished with appropriate colors and icons
- Success states are celebrated when appropriate

### 3. **Accessibility**
- All states have appropriate ARIA labels
- Error messages are announced to screen readers
- Keyboard navigation is fully supported

## Available Components

### Core Loading Components (`src/components/ui/SkeletonLoaders.tsx`)

#### 1. **SkeletonPulse**
Basic animated skeleton block for creating custom loaders.

```tsx
<SkeletonPulse className="h-6 w-3/4" />
```

#### 2. **LoadingState**
Centered spinner with optional message.

```tsx
<LoadingState message="Loading data..." size="md" />
```

#### 3. **PolicyCardSkeleton**
Skeleton loader for policy cards.

```tsx
<PolicyCardSkeleton />
```

#### 4. **ClaimsSkeleton**
Skeleton loader for claims lists.

```tsx
<ClaimsSkeleton />
```

#### 5. **ProposalCardSkeleton**
Skeleton loader for DAO proposal cards.

```tsx
<ProposalCardSkeleton />
```

#### 6. **DashboardCardSkeleton**
Skeleton loader for dashboard stat cards.

```tsx
<DashboardCardSkeleton />
```

#### 7. **StatsCardSkeleton**
Skeleton loader for statistics cards.

```tsx
<StatsCardSkeleton />
```

#### 8. **AnalyticsSkeleton**
Complete skeleton for analytics dashboard.

```tsx
<AnalyticsSkeleton />
```

#### 9. **TableSkeleton**
Skeleton for data tables.

```tsx
<TableSkeleton rows={5} cols={4} />
```

#### 10. **FormSkeleton**
Skeleton for forms.

```tsx
<FormSkeleton fields={4} />
```

### State Components

#### 11. **EmptyState**
Shows when no data is available.

```tsx
<EmptyState 
  title="No policies found"
  description="Get started by creating your first policy"
/>
```

#### 12. **ErrorState**
Shows when data loading fails with retry option.

```tsx
<ErrorState 
  title="Failed to load data"
  description="Please try again later"
  onRetry={handleRetry}
/>
```

## Implementation Pattern

### Standard Data-Fetching Component Pattern

```tsx
import { useState, useEffect } from 'react';
import { 
  PolicyCardSkeleton, 
  EmptyState, 
  ErrorState 
} from '@/components/ui/SkeletonLoaders';

export function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PolicyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Failed to load data"
        description={error}
        onRetry={loadData}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState 
        title="No items found"
        description="Try adjusting your filters"
      />
    );
  }

  return (
    <div>
      {data.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Updated Components

### 1. Policies Components

#### `src/components/policies/MyPoliciesPage.tsx`
- ✅ Loading state with `PolicyCardSkeleton`
- ✅ Error state with retry functionality
- ✅ Empty state for no policies
- ✅ Contextual empty states for filtered results

**States:**
- Loading: Shows 6 skeleton cards
- Error: Displays error message with retry button
- Empty: Different messages for filtered vs unfiltered states
- Success: Shows policy grid

#### `src/components/policies/listing/PolicyListingScreen.tsx`
- ✅ Already implemented with `PolicyListingLoadingState`
- ✅ Error state with `PolicyListingErrorState`
- ✅ Empty state handling

### 2. DAO Components

#### `src/components/dao/DAOVotingClient.tsx`
- ✅ Loading state with `ProposalCardSkeleton`
- ✅ Error state with retry functionality
- ✅ Empty state for no proposals
- ✅ Contextual empty states for search/filter results

**States:**
- Loading: Shows 3 skeleton proposal cards
- Error: Displays error with retry option
- Empty: Different messages based on filters
- Success: Shows proposals list

#### `src/components/CreateProposalModal.tsx`
- ✅ Submit loading state
- ✅ Error display for submission failures
- ✅ Disabled inputs during submission
- ✅ Loading button text

### 3. Analytics Components

#### `src/app/analytics/page.tsx`
- ✅ Loading state with `AnalyticsSkeleton`
- ✅ Error state with retry functionality
- ✅ Empty state for no analytics data

**States:**
- Loading: Shows complete analytics skeleton
- Error: Displays error with retry
- Empty: Guides user to generate data
- Success: Shows analytics dashboard

### 4. Dashboard Components

#### `src/app/dashboard/page.tsx`
- ✅ Balance loading state with `DashboardCardSkeleton`
- ✅ Skeleton for balance cards during fetch
- ✅ Proper loading indicators

**States:**
- Balance Loading: Shows 3 skeleton cards
- Balance Loaded: Shows actual balance data

### 5. Claims Components

#### `src/components/claims/ClaimTrackingDashboard.tsx`
- ✅ Already fully implemented
- ✅ Uses `ClaimsSkeleton`
- ✅ Error and empty states

#### `src/components/claims/ClaimForm.tsx`
- ✅ Already fully implemented
- ✅ Policies loading state
- ✅ Submit loading state
- ✅ Comprehensive error handling

## Acceptance Criteria Status

### ✅ All data-fetching components show skeleton loaders
- Policies listing pages
- DAO voting interface
- Analytics dashboard
- Dashboard balance cards
- Claims tracking
- Claims form

### ✅ Error states display user-friendly messages with retry buttons
- All components have `ErrorState` with retry functionality
- Error messages are clear and actionable
- Retry handlers properly reset state

### ✅ Empty states are handled gracefully
- All components show appropriate empty states
- Context-sensitive messages (filtered vs unfiltered)
- Helpful guidance for next steps

### ✅ Loading states match design system
- All skeletons use consistent styling
- Animations are smooth and subtle
- Colors match the dark theme

### ✅ No blank screens during data fetching
- All loading states show immediate feedback
- Skeleton loaders prevent layout shift
- Smooth transitions between states

### ✅ Visually consistent across the app
- All components use the same skeleton components
- Error states have consistent styling
- Empty states follow the same pattern

## Testing Checklist

- [x] Policy listing shows skeletons on load
- [x] Policy listing shows error state on failure
- [x] Policy listing shows empty state when no policies
- [x] DAO voting shows skeletons on load
- [x] DAO voting shows error state on failure
- [x] DAO voting shows empty state when no proposals
- [x] Analytics shows skeletons on load
- [x] Analytics shows error state on failure
- [x] Analytics shows empty state when no data
- [x] Dashboard shows skeletons for balance cards
- [x] All retry buttons work correctly
- [x] All empty states have appropriate messages
- [x] Keyboard navigation works in all states

## Future Enhancements

1. **Progressive Loading**
   - Implement incremental loading for large lists
   - Show partial data while loading more

2. **Optimistic Updates**
   - Show immediate feedback for user actions
   - Roll back on failure

3. **Offline Support**
   - Show cached data when offline
   - Queue actions for when connection returns

4. **Performance Monitoring**
   - Track loading times
   - Alert on slow data fetches

## Development Guidelines

### When Creating New Components

1. **Always implement all three states:**
   - Loading (skeleton)
   - Error (with retry)
   - Empty (with guidance)

2. **Use existing skeleton components** from `SkeletonLoaders.tsx`

3. **Follow the standard pattern** shown in this document

4. **Test all states** before considering the component complete

5. **Consider the user's context** when writing messages

### Code Review Checklist

- [ ] Component has loading state
- [ ] Component has error state with retry
- [ ] Component has empty state
- [ ] Skeletons match the actual content structure
- [ ] Error messages are user-friendly
- [ ] Empty states provide guidance
- [ ] All states are accessible
- [ ] Transitions are smooth

## Related Documentation

- [Accessibility Testing Guide](./accessibility-testing-guide.md)
- [Data Management Guide](./DATA_MANAGEMENT_GUIDE.md)
- [Component Design System](../src/components/ui/README.md)

## Conclusion

The application now has consistent, accessible, and user-friendly loading and error states across all data-fetching components. This provides a polished user experience with clear feedback at every stage of data interaction.
