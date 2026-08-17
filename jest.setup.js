import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { configureAxe } from 'jest-axe'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// ── jest-axe global configuration ─────────────────────────────────────────────
// Configure axe with WCAG 2.1 AA rules as the baseline for all accessibility
// tests. Components can override rules locally if needed.
configureAxe({
  rules: [
    // Ensure all automated WCAG 2.1 AA rules are enabled
    { id: 'color-contrast', enabled: true },
    { id: 'label', enabled: true },
    { id: 'aria-required-attr', enabled: true },
    { id: 'aria-roles', enabled: true },
    { id: 'aria-valid-attr', enabled: true },
    { id: 'button-name', enabled: true },
    { id: 'duplicate-id', enabled: true },
    { id: 'form-field-multiple-labels', enabled: true },
    { id: 'heading-order', enabled: true },
    { id: 'image-alt', enabled: true },
    { id: 'link-name', enabled: true },
  ],
})

// Configure fast-check for property-based testing
import fc from 'fast-check'

// Set global configuration for property-based tests
fc.configureGlobal({
  numRuns: 100, // Minimum iterations per property test
  verbose: true,
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock useAnalytics
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics() {
    return {
      trackAction: jest.fn(),
      trackPageView: jest.fn(),
      trackError: jest.fn(),
    }
  },
}))

// Mock NotificationContext
jest.mock('@/context/NotificationContext', () => ({
  useNotificationContext: () => ({
    addNotification: jest.fn()
  }),
  NotificationProvider: ({ children }) => children,
}))