'use client';

import { useEffect, useState } from 'react';
import {
  blockchainEvents,
  type BlockchainConnectionState,
  type BlockchainEvent,
  type BlockchainEventType,
} from '@/lib/blockchainEvents';

export function useBlockchainEvents(
  handler: (event: BlockchainEvent) => void,
  types?: BlockchainEventType[],
) {
  useEffect(() => blockchainEvents.subscribe(handler, types), [handler, types]);
}

export function useBlockchainConnection() {
  const [state, setState] = useState<BlockchainConnectionState>({
    mode: 'disconnected', connected: false, retryCount: 0,
  });
  useEffect(() => blockchainEvents.subscribeToState(setState), []);
  return state;
}
