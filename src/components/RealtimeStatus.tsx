'use client';

import { useBlockchainConnection } from '@/hooks/useBlockchainEvents';

export function RealtimeStatus({ className = '' }: { className?: string }) {
  const { connected, mode } = useBlockchainConnection();
  const label = mode === 'disconnected' ? 'Connect wallet for live updates' : mode === 'polling' ? 'Polling fallback' : connected ? 'Live updates' : 'Reconnecting';
  return (
    <span className={`inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`} title={`Blockchain updates: ${mode}`}>
      <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
      {label}
    </span>
  );
}
