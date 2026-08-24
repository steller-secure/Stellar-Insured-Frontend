/**
 * Transaction Event System for Balance Updates
 * 
 * This module provides a global event system for tracking transactions
 * and automatically refreshing wallet balances after transaction confirmations.
 */

type TransactionEventHandler = (transactionHash: string) => void;

class TransactionEventEmitter {
  private static instance: TransactionEventEmitter;
  private listeners: Set<TransactionEventHandler> = new Set();

  private constructor() {}

  static getInstance(): TransactionEventEmitter {
    if (!TransactionEventEmitter.instance) {
      TransactionEventEmitter.instance = new TransactionEventEmitter();
    }
    return TransactionEventEmitter.instance;
  }

  /**
   * Subscribe to transaction events
   */
  subscribe(handler: TransactionEventHandler): () => void {
    this.listeners.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(handler);
    };
  }

  /**
   * Emit transaction event to all listeners
   */
  emit(transactionHash: string): void {
    this.listeners.forEach(listener => {
      try {
        listener(transactionHash);
      } catch (error) {
        console.error('Error in transaction event listener:', error);
      }
    });
  }

  /**
   * Clear all listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get number of active listeners
   */
  getListenerCount(): number {
    return this.listeners.size;
  }
}

// Export singleton instance
export const transactionEventEmitter = TransactionEventEmitter.getInstance();

/**
 * Hook to listen for transaction events and trigger balance refresh
 */
import { useEffect } from 'react';
import { useWalletBalance } from '@/hooks/useWalletBalance';

export function useTransactionBalanceRefresh() {
  const { triggerPostTransactionRefresh } = useWalletBalance();

  useEffect(() => {
    // Subscribe to transaction events
    const unsubscribe = transactionEventEmitter.subscribe((transactionHash: string) => {
      console.log('Transaction detected, scheduling balance refresh:', transactionHash.slice(0, 8));
      triggerPostTransactionRefresh();
    });

    return unsubscribe;
  }, [triggerPostTransactionRefresh]);
}

/**
 * Utility function to notify the system of a completed transaction
 */
export function notifyTransactionComplete(transactionHash: string): void {
  console.log('Transaction complete notification:', transactionHash);
  transactionEventEmitter.emit(transactionHash);
}
