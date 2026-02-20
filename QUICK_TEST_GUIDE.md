# Quick Guide: Adding Tests to Reach 80% Coverage

## Current Status
- **Current Coverage**: ~51%
- **Target Coverage**: 80%
- **Gap**: ~29% more coverage needed

## Priority Areas (Ordered by Impact)

### 1. App Pages (Highest Impact - Currently 0%)

Add these test files to quickly boost coverage:

```bash
# Create test files for pages
touch src/app/__tests__/page.test.tsx
touch src/app/dao/voting/__tests__/page.test.tsx
touch src/app/policies/__tests__/[id].test.tsx
```

**Example Page Test:**
```typescript
// src/app/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/components/auth-provider';
import Home from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

### 2. NavBar Component (High Impact)

```bash
touch src/components/NavBar/__tests__/NavBar.test.tsx
```

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/components/auth-provider';
import NavBar from '../NavBar';

describe('NavBar', () => {
  it('renders navigation links', () => {
    render(
      <AuthProvider>
        <NavBar />
      </AuthProvider>
    );
    expect(screen.getByText(/policies/i)).toBeInTheDocument();
  });
});
```

### 3. HowItWorksSection Components

```bash
touch src/components/HowItWorksSection/__tests__/HowItWorksSection.test.tsx
touch src/components/HowItWorksSection/__tests__/StepCard.test.tsx
```

### 4. Policy Purchase Modal

```bash
touch src/components/policies/purchase/__tests__/PolicyPurchaseEntryModal.test.tsx
```

### 5. Policy Category Listing

```bash
touch src/components/policies/listing/__tests__/PolicyCategoryListingScreen.test.tsx
```

## Quick Test Templates

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = jest.fn();
    render(<ComponentName onClick={mockFn} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Page Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/components/auth-provider';
import Page from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

describe('Page', () => {
  it('renders main content', () => {
    render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

### Integration Test Template
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/components/auth-provider';
import Component from './Component';

describe('Feature Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes user flow', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Component />
      </AuthProvider>
    );

    // Step 1
    await user.click(screen.getByRole('button', { name: /start/i }));
    
    // Step 2
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

## Commands to Run

```bash
# Check current coverage
npm run test:coverage

# Run specific test file
npm test -- ComponentName.test.tsx

# Run tests in watch mode while developing
npm run test:watch

# Run all tests
npm test
```

## Coverage Calculation

To reach 80% from 51%, you need to test approximately:
- **15-20 more components** (medium complexity)
- **5-8 app pages**
- **3-5 integration flows**

## Estimated Time to 80%

- **App Pages**: 2-3 hours (high impact)
- **NavBar**: 30 minutes
- **HowItWorksSection**: 1 hour
- **Policy Components**: 2 hours
- **Additional Integration Tests**: 2 hours

**Total**: ~8-10 hours of focused testing work

## Tips for Efficient Testing

1. **Start with pages** - They import many components, boosting coverage quickly
2. **Test happy paths first** - Get basic coverage, then add edge cases
3. **Use existing tests as templates** - Copy and modify similar tests
4. **Run coverage frequently** - Check progress with `npm run test:coverage`
5. **Focus on critical paths** - Auth, policy purchase, claims, voting
6. **Don't over-test** - Aim for meaningful tests, not 100% coverage

## Common Mocks Needed

```typescript
// Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
  usePathname: () => '/current-path',
}));

// Freighter Wallet
jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn(),
  getPublicKey: jest.fn(),
  signTransaction: jest.fn(),
}));

// LocalStorage
beforeEach(() => {
  localStorage.clear();
});
```

## Verification

After adding tests, verify coverage:

```bash
npm run test:coverage

# Check the output for:
# All files | >80% | >80% | >80% | >80%
```

## CI/CD Integration

Once you reach 80%, the CI/CD pipeline will:
- ✅ Run tests on every push
- ✅ Block PRs if coverage drops below 80%
- ✅ Upload coverage reports to Codecov
- ✅ Comment coverage changes on PRs

## Need Help?

- Check existing tests in `src/components/**/*.test.tsx`
- Review integration tests in `src/app/**/__tests__/*.test.tsx`
- See `TEST_COVERAGE.md` for detailed documentation
- Run `npm test -- --help` for Jest options
