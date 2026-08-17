import {
  BLOCKCHAIN_EVENT_DEDUP_TTL,
  BLOCKCHAIN_EVENT_POLL_INTERVAL,
  BLOCKCHAIN_EVENT_RECONNECT_BASE_DELAY,
  BLOCKCHAIN_EVENT_RECONNECT_MAX_DELAY,
} from '@/config/constants';
import { getBlockchainDataSource } from '@/config/dataSource';
import { scValToNative, xdr } from '@stellar/stellar-sdk';

export type BlockchainEventType =
  | 'policy.purchased'
  | 'policy.updated'
  | 'claim.submitted'
  | 'claim.updated'
  | 'proposal.updated'
  | 'vote.cast'
  | 'account.updated'
  | 'unknown';

export interface BlockchainEvent<T = Record<string, unknown>> {
  id: string;
  type: BlockchainEventType;
  ledger?: number;
  timestamp: number;
  account?: string;
  resourceId?: string;
  transactionHash?: string;
  data: T;
}

export type ConnectionMode = 'websocket' | 'eventsource' | 'polling' | 'disconnected';
export interface BlockchainConnectionState {
  mode: ConnectionMode;
  connected: boolean;
  retryCount: number;
}

type EventListener = (event: BlockchainEvent) => void;
type StateListener = (state: BlockchainConnectionState) => void;

function parseEvent(input: unknown): BlockchainEvent | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  const data = (value.data && typeof value.data === 'object' ? value.data : value) as Record<string, unknown>;
  const rawType = String(value.type ?? value.eventType ?? data.type ?? 'unknown').toLowerCase();
  const aliases: Record<string, BlockchainEventType> = {
    policy_purchase: 'policy.purchased', policy_purchased: 'policy.purchased', purchase_policy: 'policy.purchased',
    policy_updated: 'policy.updated', claim_submission: 'claim.submitted', claim_submitted: 'claim.submitted',
    submit_claim: 'claim.submitted', claim_updated: 'claim.updated', claim_status_changed: 'claim.updated',
    proposal_updated: 'proposal.updated', proposal_status_changed: 'proposal.updated',
    vote_cast: 'vote.cast', voting_results: 'vote.cast', account_updated: 'account.updated',
  };
  const type = aliases[rawType] ?? (rawType.includes('.') ? rawType as BlockchainEventType : 'unknown');
  const transactionHash = String(value.transactionHash ?? value.txHash ?? value.hash ?? data.transactionHash ?? '');
  const ledger = Number(value.ledger ?? value.ledgerSequence ?? data.ledger) || undefined;
  const resourceId = String(value.resourceId ?? data.policyId ?? data.claimId ?? data.proposalId ?? '') || undefined;
  const id = String(value.id ?? value.paging_token ?? `${transactionHash}:${type}:${resourceId ?? ledger ?? JSON.stringify(data)}`);
  return {
    id,
    type,
    ledger,
    resourceId,
    transactionHash: transactionHash || undefined,
    account: String(value.account ?? data.account ?? data.walletAddress ?? '') || undefined,
    timestamp: typeof value.timestamp === 'number' ? value.timestamp : Date.parse(String(value.timestamp ?? value.created_at ?? '')) || Date.now(),
    data,
  };
}

function decodeScVal(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try { return scValToNative(xdr.ScVal.fromXDR(value, 'base64')); }
  catch { return value; }
}

function parseSorobanEvent(input: unknown): BlockchainEvent | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  const topics = Array.isArray(value.topic) ? value.topic.map(decodeScVal) : [];
  const topic = topics.map(item => String(item).toLowerCase()).join('_');
  const data = decodeScVal(value.value);
  return parseEvent({
    id: value.id,
    type: topic,
    ledger: value.ledger,
    transactionHash: value.txHash,
    account: topics.find(item => typeof item === 'string' && /^G[A-Z2-7]{55}$/.test(item)),
    data: typeof data === 'object' && data ? data : { value: data, topics },
  });
}

class BlockchainEventClient {
  private listeners = new Set<EventListener>();
  private stateListeners = new Set<StateListener>();
  private socket: WebSocket | null = null;
  private source: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private polling = false;
  private stopped = true;
  private retryCount = 0;
  private cursor = 'now';
  private horizonCursor = 'now';
  private sorobanLedger?: number;
  private account?: string;
  private seen = new Map<string, number>();
  private state: BlockchainConnectionState = { mode: 'disconnected', connected: false, retryCount: 0 };

  start(account?: string) {
    if (!this.stopped && this.account === account) return;
    const accountChanged = this.account !== account;
    this.stop();
    this.stopped = false;
    this.account = account;
    if (accountChanged) {
      this.cursor = 'now';
      this.horizonCursor = 'now';
      this.sorobanLedger = undefined;
      this.seen.clear();
    }
    this.connect();
  }

  stop() {
    this.stopped = true;
    this.socket?.close();
    this.source?.close();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pollTimer) clearTimeout(this.pollTimer);
    if (this.recoveryTimer) clearTimeout(this.recoveryTimer);
    this.socket = null;
    this.source = null;
    this.reconnectTimer = null;
    this.pollTimer = null;
    this.recoveryTimer = null;
    this.polling = false;
    this.updateState('disconnected', false);
  }

  subscribe(listener: EventListener, types?: BlockchainEventType[]) {
    const wrapped: EventListener = event => {
      if (!types || types.includes(event.type)) listener(event);
    };
    this.listeners.add(wrapped);
    return () => { this.listeners.delete(wrapped); };
  }

  subscribeToState(listener: StateListener) {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => { this.stateListeners.delete(listener); };
  }

  private connect() {
    const config = getBlockchainDataSource();
    if (config.websocketUrl && typeof WebSocket !== 'undefined') return this.connectWebSocket(config.websocketUrl);
    if (config.eventSourceUrl && typeof EventSource !== 'undefined') return this.connectEventSource(config.eventSourceUrl);
    if (config.sorobanRpcUrl && config.contractIds.length) return this.startPolling();
    if (this.account && typeof EventSource !== 'undefined') {
      return this.connectEventSource(`${config.horizonUrl}/accounts/${this.account}/transactions`, true);
    }
    this.startPolling();
  }

  private withParams(rawUrl: string) {
    const url = new URL(rawUrl, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
    if (this.account) url.searchParams.set('account', this.account);
    url.searchParams.set('cursor', this.cursor);
    return url.toString();
  }

  private connectWebSocket(url: string) {
    try {
      const target = this.withParams(url).replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      this.socket = new WebSocket(target);
      this.updateState('websocket', false);
      this.socket.onopen = () => this.onConnected('websocket');
      this.socket.onmessage = event => this.handlePayload(event.data);
      this.socket.onerror = () => this.socket?.close();
      this.socket.onclose = () => this.reconnectOrPoll();
    } catch { this.reconnectOrPoll(); }
  }

  private connectEventSource(url: string, horizon = false) {
    try {
      const target = horizon
        ? `${url}?cursor=${encodeURIComponent(this.horizonCursor)}&order=asc`
        : this.withParams(url);
      this.source = new EventSource(target);
      this.updateState('eventsource', false);
      this.source.onopen = () => this.onConnected('eventsource');
      this.source.onmessage = event => horizon ? this.handleHorizonPayload(event.data) : this.handlePayload(event.data);
      this.source.onerror = () => { this.source?.close(); this.reconnectOrPoll(); };
    } catch { this.reconnectOrPoll(); }
  }

  private onConnected(mode: ConnectionMode) {
    this.retryCount = 0;
    this.polling = false;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.pollTimer = null;
    this.updateState(mode, true);
  }

  private reconnectOrPoll() {
    if (this.stopped) return;
    const delay = Math.min(BLOCKCHAIN_EVENT_RECONNECT_BASE_DELAY * 2 ** this.retryCount, BLOCKCHAIN_EVENT_RECONNECT_MAX_DELAY);
    this.retryCount += 1;
    this.updateState(this.state.mode, false);
    if (this.retryCount >= 3) return this.startPolling();
    this.reconnectTimer = setTimeout(() => this.connect(), delay + Math.random() * 500);
  }

  private startPolling() {
    if (this.polling || this.stopped) return;
    this.polling = true;
    this.updateState('polling', true);
    const poll = async () => {
      if (this.stopped) return;
      try {
        await this.pollSources();
        this.updateState('polling', true);
      } catch { this.updateState('polling', false); }
      this.pollTimer = setTimeout(poll, BLOCKCHAIN_EVENT_POLL_INTERVAL);
    };
    void poll();
    this.scheduleStreamingRecovery();
  }

  private scheduleStreamingRecovery() {
    const config = getBlockchainDataSource();
    const canStream = Boolean(
      config.websocketUrl ||
      config.eventSourceUrl ||
      (this.account && !(config.sorobanRpcUrl && config.contractIds.length)),
    );
    if (!canStream || this.stopped || this.recoveryTimer) return;
    this.recoveryTimer = setTimeout(() => {
      this.recoveryTimer = null;
      if (this.stopped) return;
      this.polling = false;
      if (this.pollTimer) clearTimeout(this.pollTimer);
      this.pollTimer = null;
      this.retryCount = 0;
      this.connect();
    }, BLOCKCHAIN_EVENT_RECONNECT_MAX_DELAY);
  }

  private async pollSources() {
    const config = getBlockchainDataSource();
    let succeeded = false;
    let lastError: unknown;
    if (config.pollingUrl) {
      try {
        const response = await fetch(this.withParams(config.pollingUrl), { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Event polling failed (${response.status})`);
        const payload = await response.json();
        const events = Array.isArray(payload) ? payload : payload.events ?? payload.records ?? [];
        events.forEach((event: unknown) => this.emit(event));
        if (payload.cursor) this.cursor = String(payload.cursor);
        succeeded = true;
      } catch (error) { lastError = error; }
    }
    if (config.sorobanRpcUrl && config.contractIds.length) {
      try {
        if (!this.sorobanLedger) {
          const latestResponse = await fetch(config.sorobanRpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestLedger' }),
          });
          if (!latestResponse.ok) throw new Error(`Soroban ledger lookup failed (${latestResponse.status})`);
          const latestPayload = await latestResponse.json();
          if (latestPayload.error) throw new Error(latestPayload.error.message || 'Soroban ledger lookup failed');
          this.sorobanLedger = Number(latestPayload.result?.sequence);
          if (!this.sorobanLedger) throw new Error('Soroban RPC returned an invalid ledger sequence');
        }
        const startLedger = this.sorobanLedger + 1;
        const response = await fetch(config.sorobanRpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1, method: 'getEvents',
            params: {
              startLedger,
              filters: [{ type: 'contract', contractIds: config.contractIds }],
              pagination: { limit: 100 },
            },
          }),
        });
        if (!response.ok) throw new Error(`Soroban event polling failed (${response.status})`);
        const payload = await response.json();
        if (payload.error) throw new Error(payload.error.message || 'Soroban event polling failed');
        const events = payload.result?.events ?? [];
        events.forEach((event: unknown) => {
          const parsed = parseSorobanEvent(event);
          if (parsed) {
            this.emit(parsed);
            if (parsed.ledger) this.sorobanLedger = Math.max(this.sorobanLedger ?? 0, parsed.ledger);
          }
        });
        succeeded = true;
      } catch (error) { lastError = error; }
    }
    if (this.account) {
      try {
        const url = new URL(`${config.horizonUrl}/accounts/${this.account}/transactions`);
        url.searchParams.set('cursor', this.horizonCursor);
        url.searchParams.set('order', 'asc');
        url.searchParams.set('limit', '50');
        const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Horizon polling failed (${response.status})`);
        const payload = await response.json();
        const records = payload._embedded?.records ?? [];
        records.forEach((record: Record<string, unknown>) => this.emit({
          id: record.id ?? record.paging_token,
          type: 'account.updated', account: this.account, transactionHash: record.hash,
          ledger: record.ledger, timestamp: record.created_at, data: record,
        }));
        const last = records.at?.(-1) ?? records[records.length - 1];
        if (last?.paging_token) this.horizonCursor = String(last.paging_token);
        succeeded = true;
      } catch (error) { lastError = error; }
    }
    if (!succeeded) throw lastError ?? new Error('No blockchain event source is configured');
  }

  private handlePayload(payload: string) {
    try {
      const parsed = JSON.parse(payload);
      (Array.isArray(parsed) ? parsed : [parsed]).forEach(event => this.emit(event));
    } catch { /* ignore malformed third-party messages */ }
  }

  private handleHorizonPayload(payload: string) {
    try {
      const record = JSON.parse(payload) as Record<string, unknown>;
      if (record.paging_token) this.horizonCursor = String(record.paging_token);
      this.emit({
        id: record.id ?? record.paging_token,
        type: 'account.updated',
        account: this.account,
        transactionHash: record.hash,
        ledger: record.ledger,
        timestamp: record.created_at,
        data: record,
      });
    } catch { /* ignore malformed Horizon messages */ }
  }

  private emit(input: unknown) {
    const event = parseEvent(input);
    if (!event) return;
    const now = Date.now();
    for (const [id, timestamp] of this.seen) if (now - timestamp > BLOCKCHAIN_EVENT_DEDUP_TTL) this.seen.delete(id);
    if (this.seen.has(event.id)) return;
    this.seen.set(event.id, now);
    if (event.ledger) this.cursor = String(event.ledger);
    if (this.account && event.account && event.account.toUpperCase() !== this.account.toUpperCase()) return;
    this.listeners.forEach(listener => listener(event));
  }

  private updateState(mode: ConnectionMode, connected: boolean) {
    this.state = { mode, connected, retryCount: this.retryCount };
    this.stateListeners.forEach(listener => listener(this.state));
  }
}

export const blockchainEvents = new BlockchainEventClient();
