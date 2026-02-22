import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../components/ui/toast';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
}

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number | null; // Duration in milliseconds, null means persistent
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { showToast } = useToast();

  const addNotification = useCallback(({ title = '', message, type = 'info', duration = 5000 }: NotificationOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      id,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast if duration is specified (non-persistent notification)
    if (duration !== null) {
      showToast(message, type);
    }

    return id;
  }, [showToast]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Clean up old notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Remove notifications older than 1 hour that are marked as read
      setNotifications(prev => 
        prev.filter(notification => 
          !notification.read || (Date.now() - notification.timestamp < 3600000)
        )
      );
    }, 60000); // Run cleanup every minute

    return () => clearInterval(interval);
  }, []);

  // Wallet-specific notification helpers
  const showWalletConnected = useCallback((address: string) => {
    addNotification({
      title: 'Wallet Connected',
      message: `Successfully connected to wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
      type: 'success',
    });
  }, [addNotification]);

  const showWalletDisconnected = useCallback(() => {
    addNotification({
      title: 'Wallet Disconnected',
      message: 'Your wallet has been disconnected',
      type: 'info',
    });
  }, [addNotification]);

  const showWalletError = useCallback((error: string) => {
    addNotification({
      title: 'Wallet Error',
      message: error,
      type: 'error',
    });
  }, [addNotification]);

  const showBalanceUpdated = useCallback((amount: number, asset: string = 'XLM') => {
    addNotification({
      title: 'Balance Updated',
      message: `Your ${asset} balance has been updated to ${amount.toFixed(4)} ${asset}`,
      type: 'info',
    });
  }, [addNotification]);

  const showNetworkChanged = useCallback((oldNetwork: string, newNetwork: string) => {
    addNotification({
      title: 'Network Changed',
      message: `Network switched from ${oldNetwork} to ${newNetwork}`,
      type: 'info',
    });
  }, [addNotification]);

  const showTransactionPending = useCallback((transactionId: string) => {
    addNotification({
      title: 'Transaction Pending',
      message: `Transaction ${transactionId.slice(0, 8)}... is pending confirmation`,
      type: 'info',
      duration: null as number | null, // Persistent notification
    });
  }, [addNotification]);

  const showTransactionSuccess = useCallback((transactionId: string) => {
    addNotification({
      title: 'Transaction Successful',
      message: `Transaction ${transactionId.slice(0, 8)}... confirmed successfully`,
      type: 'success',
    });
  }, [addNotification]);

  const showTransactionError = useCallback((transactionId: string, error: string) => {
    addNotification({
      title: 'Transaction Failed',
      message: `Transaction ${transactionId.slice(0, 8)}... failed: ${error}`,
      type: 'error',
    });
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    // Wallet-specific helpers
    showWalletConnected,
    showWalletDisconnected,
    showWalletError,
    showBalanceUpdated,
    showNetworkChanged,
    showTransactionPending,
    showTransactionSuccess,
    showTransactionError,
  };
}