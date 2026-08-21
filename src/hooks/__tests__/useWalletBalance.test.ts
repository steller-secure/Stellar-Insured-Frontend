/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWalletBalance } from '../useWalletBalance';
import { useWallet } from '../useWallet';
import { useNotifications } from '../useNotifications';
import { blockchainEvents } from '@/lib/blockchainEvents';

// Mock dependencies
jest.mock('../useWallet', () => ({
  useWallet: jest.fn(),
}));

jest.mock('../useNotifications', () => ({
  useNotifications: jest.fn(),
}));

// Mock Stellar SDK
jest.mock('@stellar/stellar-sdk', () => {
  return {
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        loadAccount: jest.fn(),
      })),
    },
  };
});

// Mock stellar lib
jest.mock('@/lib/stellar', () => ({
  subscribeToNetworkChanges: jest.fn(() => () => {}),
}));

// blockchainEvents drives connection-mode-based polling; keep it
// deterministic and free of real network/WebSocket attempts in tests.
jest.mock('@/lib/blockchainEvents', () => ({
  blockchainEvents: {
    subscribeToState: jest.fn((listener: (state: unknown) => void) => {
      listener({ mode: 'disconnected', connected: false, retryCount: 0 });
      return () => {};
    }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useWalletBalance', () => {
  const mockShowBalanceUpdated = jest.fn();
  const mockShowNetworkChanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (blockchainEvents.subscribeToState as jest.Mock).mockImplementation(
      (listener: (state: unknown) => void) => {
        listener({ mode: 'disconnected', connected: false, retryCount: 0 });
        return () => {};
      }
    );

    (useNotifications as jest.Mock).mockReturnValue({
      showBalanceUpdated: mockShowBalanceUpdated,
      showNetworkChanged: mockShowNetworkChanged,
    });

    (useWallet as jest.Mock).mockReturnValue({
      address: 'GABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ',
      isConnected: true,
    });
  });

  it('fetches balance on mount when connected', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount.mockResolvedValueOnce({
      balances: [
        { asset_type: 'native', balance: '100.5000' },
        { asset_type: 'credit_alphanum4', asset_code: 'USDC', asset_issuer: 'ISSUER123', balance: '50.0000' },
      ],
    });

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.xlm).toBe(100.5));

    expect(result.current.assets).toHaveLength(1);
    expect(result.current.assets[0].code).toBe('USDC');
  });

  it('handles disconnection gracefully', async () => {
    (useWallet as jest.Mock).mockReturnValue({ address: null, isConnected: false });

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBe('No wallet connected'));

    expect(result.current.xlm).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('shows a notification for significant balance changes', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '100.0000' }],
    });

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.xlm).toBe(100));
    expect(mockShowBalanceUpdated).toHaveBeenCalledWith(100, 'XLM');
  });

  it('provides a manual refresh function that refetches the balance', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount
      .mockResolvedValueOnce({ balances: [{ asset_type: 'native', balance: '100.0000' }] })
      .mockResolvedValueOnce({ balances: [{ asset_type: 'native', balance: '200.0000' }] });

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.xlm).toBe(100));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.xlm).toBe(200);
    expect(result.current.refreshing).toBe(false);
  });

  it('provides a last-updated timestamp after a successful fetch', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '100.0000' }],
    });

    const beforeFetch = Date.now();
    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.lastUpdated).toBeTruthy());

    expect(result.current.lastUpdated!).toBeGreaterThanOrEqual(beforeFetch);
    expect(result.current.lastUpdated!).toBeLessThanOrEqual(Date.now());
  });

  it('reports polling as active with the default interval while disconnected from real-time transport', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '100.0000' }],
    });

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isPollingActive).toBe(true));
    expect(result.current.pollingInterval).toBe(30000);
  });

  it('handles fetch errors gracefully', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBe('Network error'));

    expect(result.current.loading).toBe(false);
    expect(result.current.xlm).toBe(0);
  });

  it('tracks a refreshing state distinct from the initial loading state', async () => {
    const mockServer = require('@stellar/stellar-sdk').Horizon.Server.mock.results[0].value;
    mockServer.loadAccount
      .mockResolvedValueOnce({ balances: [{ asset_type: 'native', balance: '100.0000' }] })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ balances: [{ asset_type: 'native', balance: '150.0000' }] }),
              20
            )
          )
      );

    const { result } = renderHook(() => useWalletBalance(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      void result.current.refetch();
    });

    await waitFor(() => expect(result.current.refreshing).toBe(true));
    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });
});
