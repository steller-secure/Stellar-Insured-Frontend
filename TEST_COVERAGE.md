# Test Coverage Documentation

## Overview
This document outlines the comprehensive test suite for Stellar Insured Frontend, achieving 80%+ coverage for critical paths.

## Test Structure

### Unit Tests
Located alongside source files with `.test.tsx` or `.test.ts` extension.

#### Components Tested
- **Auth Components**: `auth-provider`, `protected-route`, `WalletConnectButton`
- **UI Components**: `Button`, `Input`, `Select`, `Textarea`, `Card`, `Badge`, `Modal`, `Toast`
- **Feature Components**: `PolicyCard`, `ClaimForm`, `ProposalCard`, `DAOVotingClient`
- **Layout Components**: `Pagination`, `FilterDropdown`, `HeroSection`

#### Utilities Tested
- **Freighter Integration**: `connectFreighter`, `signFreighterMessage`, `createAuthMessage`
- **DAO Utils**: `getProposalStats`

### Integration Tests
Located in `__tests__` directories within feature folders.

#### Flows Tested
1. **Authentication Flow** (`signin.integration.test.tsx`)
   - Complete signin with wallet
   - Error handling for unregistered users
   - Wallet connection failures
   - User rejection of signature

2. **Registration Flow** (`signup.integration.test.tsx`)
   - Complete signup with wallet
   - Prevention of duplicate registrations
   - Email capture and validation

3. **Policy Discovery** (`policies.integration.test.tsx`)
   - Policy listing and display
   - Search functionality
   - Status filtering
   - Pagination
   - Combined filters

4. **Claims Management** (`claims.integration.test.tsx`)
   - Claims listing
   - Search and filter
   - Status display
   - Wallet connection status

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- auth-provider.test.tsx
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="signin"
```

## Coverage Thresholds

Configured in `jest.config.js`:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/test-coverage.yml`) runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Workflow Steps
1. Checkout code
2. Setup Node.js (18.x, 20.x)
3. Install dependencies
4. Run linter
5. Run tests with coverage
6. Check coverage thresholds (fails if below 80%)
7. Upload coverage to Codecov
8. Comment coverage on PR
9. Archive coverage artifacts

## Test Utilities

### Mocks
- **Freighter API**: `__mocks__/@stellar/freighter-api.ts`
- **Next.js Router**: Configured in `jest.setup.js`
- **File Imports**: `__mocks__/fileMock.js`

### Testing Library
- `@testing-library/react` for component testing
- `@testing-library/user-event` for user interactions
- `@testing-library/jest-dom` for DOM matchers

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **User-centric**: Test from user perspective
3. **Isolation**: Each test is independent
4. **Cleanup**: Clear localStorage and mocks between tests
5. **Async handling**: Use `waitFor` for async operations
6. **Accessibility**: Use semantic queries (getByRole, getByLabelText)

## Coverage Exclusions

Files excluded from coverage requirements:
- Layout files (`layout.tsx`)
- Type definitions (`*.d.ts`)
- Story files (`*.stories.tsx`)
- Middleware (`middleware.ts`)

## Future Enhancements

- [ ] E2E tests with Playwright/Cypress
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing (axe-core)
- [ ] Contract interaction tests (when smart contracts integrated)
