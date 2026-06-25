import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';

// Mock the toast component
const mockShowToast = jest.fn();
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ──────────────────────────────────────────────────────────
  // addNotification
  // ──────────────────────────────────────────────────────────
  describe('addNotification()', () => {
    it('adds a notification to the list and returns its id', () => {
      const { result } = renderHook(() => useNotifications());

      let id: string;
      act(() => {
        id = result.current.addNotification({
          title: 'Info',
          message: 'Test message',
          type: 'info',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe(id!);
      expect(result.current.notifications[0].title).toBe('Info');
      expect(result.current.notifications[0].message).toBe('Test message');
      expect(result.current.notifications[0].type).toBe('info');
      expect(result.current.notifications[0].read).toBe(false);
    });

    it('calls showToast with formatted message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ title: 'Alert', message: 'Something happened', type: 'warning' });
      });

      expect(mockShowToast).toHaveBeenCalledWith('Alert: Something happened', 'warning');
    });

    it('calls showToast with just the message when no title', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'No title here', type: 'success' });
      });

      expect(mockShowToast).toHaveBeenCalledWith('No title here', 'success');
    });

    it('defaults type to "info" when not specified', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'Default type' });
      });

      expect(result.current.notifications[0].type).toBe('info');
    });

    it('prepends new notifications (most recent first)', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'First' });
        result.current.addNotification({ message: 'Second' });
      });

      expect(result.current.notifications[0].message).toBe('Second');
      expect(result.current.notifications[1].message).toBe('First');
    });
  });

  // ──────────────────────────────────────────────────────────
  // removeNotification
  // ──────────────────────────────────────────────────────────
  describe('removeNotification()', () => {
    it('removes a notification by id', () => {
      const { result } = renderHook(() => useNotifications());

      let id: string;
      act(() => {
        id = result.current.addNotification({ message: 'To remove' });
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        result.current.removeNotification(id!);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('does not remove other notifications', () => {
      const { result } = renderHook(() => useNotifications());
      const ids: string[] = [];

      act(() => {
        ids.push(result.current.addNotification({ message: 'Keep me' }));
        ids.push(result.current.addNotification({ message: 'Remove me' }));
      });

      act(() => {
        result.current.removeNotification(ids[1]);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].message).toBe('Keep me');
    });

    it('is a no-op for unknown id', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'I exist' });
      });

      act(() => {
        result.current.removeNotification('nonexistent-id');
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────────────────────────
  // markAsRead / markAllAsRead
  // ──────────────────────────────────────────────────────────
  describe('markAsRead()', () => {
    it('marks a single notification as read', () => {
      const { result } = renderHook(() => useNotifications());
      let id: string;

      act(() => {
        id = result.current.addNotification({ message: 'Unread' });
      });

      expect(result.current.notifications[0].read).toBe(false);

      act(() => {
        result.current.markAsRead(id!);
      });

      expect(result.current.notifications[0].read).toBe(true);
    });

    it('does not affect other notifications', () => {
      const { result } = renderHook(() => useNotifications());
      const ids: string[] = [];

      act(() => {
        ids.push(result.current.addNotification({ message: 'A' }));
        ids.push(result.current.addNotification({ message: 'B' }));
      });

      act(() => {
        result.current.markAsRead(ids[0]);
      });

      const notifA = result.current.notifications.find((n) => n.id === ids[0])!;
      const notifB = result.current.notifications.find((n) => n.id === ids[1])!;
      expect(notifA.read).toBe(true);
      expect(notifB.read).toBe(false);
    });
  });

  describe('markAllAsRead()', () => {
    it('marks all notifications as read', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'A' });
        result.current.addNotification({ message: 'B' });
        result.current.addNotification({ message: 'C' });
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.notifications.every((n) => n.read)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // unreadCount
  // ──────────────────────────────────────────────────────────
  describe('unreadCount', () => {
    it('is 0 initially', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.unreadCount).toBe(0);
    });

    it('increments when notifications are added', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'A' });
        result.current.addNotification({ message: 'B' });
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it('decrements when a notification is marked as read', () => {
      const { result } = renderHook(() => useNotifications());
      let id: string;

      act(() => {
        id = result.current.addNotification({ message: 'A' });
        result.current.addNotification({ message: 'B' });
      });

      act(() => {
        result.current.markAsRead(id!);
      });

      expect(result.current.unreadCount).toBe(1);
    });

    it('becomes 0 after markAllAsRead', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'A' });
        result.current.addNotification({ message: 'B' });
      });

      act(() => { result.current.markAllAsRead(); });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Cleanup interval
  // ──────────────────────────────────────────────────────────
  describe('Cleanup interval', () => {
    it('removes old read notifications after 1 hour', () => {
      const { result } = renderHook(() => useNotifications());
      let id: string;

      act(() => {
        id = result.current.addNotification({ message: 'Old read' });
      });

      act(() => { result.current.markAsRead(id!); });

      // Advance past 1 hour AND trigger the 1-minute interval
      act(() => {
        jest.advanceTimersByTime(3600001 + 60000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('keeps unread notifications regardless of age', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({ message: 'Unread old' });
      });

      act(() => {
        jest.advanceTimersByTime(3600001 + 60000);
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('clears interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = renderHook(() => useNotifications());

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  // Wallet-specific helpers
  // ──────────────────────────────────────────────────────────
  describe('Wallet Notification Helpers', () => {
    it('showWalletConnected adds a success notification with truncated address', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showWalletConnected('GABCDEF1234567890XYZ');
      });

      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[0].title).toBe('Wallet Connected');
      expect(result.current.notifications[0].message).toContain('GABCDE');
      expect(result.current.notifications[0].message).toContain('0XYZ');
    });

    it('showWalletDisconnected adds an info notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showWalletDisconnected(); });

      expect(result.current.notifications[0].type).toBe('info');
      expect(result.current.notifications[0].title).toBe('Wallet Disconnected');
    });

    it('showWalletError adds an error notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showWalletError('Connection refused'); });

      expect(result.current.notifications[0].type).toBe('error');
      expect(result.current.notifications[0].message).toBe('Connection refused');
    });

    it('showBalanceUpdated includes amount and asset in message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showBalanceUpdated(1234.5678, 'XLM'); });

      expect(result.current.notifications[0].message).toContain('1234.5678');
      expect(result.current.notifications[0].message).toContain('XLM');
    });

    it('showBalanceUpdated defaults to XLM asset', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showBalanceUpdated(50); });

      expect(result.current.notifications[0].message).toContain('XLM');
    });

    it('showNetworkChanged mentions old and new network', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showNetworkChanged('testnet', 'mainnet'); });

      const msg = result.current.notifications[0].message;
      expect(msg).toContain('testnet');
      expect(msg).toContain('mainnet');
    });

    it('showTransactionPending adds an info notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showTransactionPending('tx-abc123456789'); });

      expect(result.current.notifications[0].type).toBe('info');
      expect(result.current.notifications[0].title).toBe('Transaction Pending');
    });

    it('showTransactionSuccess adds a success notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showTransactionSuccess('tx-abc123456789'); });

      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[0].title).toBe('Transaction Successful');
    });

    it('showTransactionError adds an error notification with tx id and error', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => { result.current.showTransactionError('tx-abc123456789', 'insufficient funds'); });

      expect(result.current.notifications[0].type).toBe('error');
      expect(result.current.notifications[0].message).toContain('insufficient funds');
    });
  });
});
