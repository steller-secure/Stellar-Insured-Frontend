import { blockchainEvents } from './blockchainEvents';

describe('blockchainEvents', () => {
  afterEach(() => {
    blockchainEvents.stop();
    jest.restoreAllMocks();
  });

  it('falls back to polling and deduplicates stale events', async () => {
    const event = { id: 'same-event', type: 'claim.updated', data: { claimId: 'c1' } };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [event, event], cursor: '12' }),
    } as Response);
    Object.defineProperty(global, 'fetch', { value: fetchMock, configurable: true });
    const listener = jest.fn();
    const unsubscribe = blockchainEvents.subscribe(listener);

    blockchainEvents.start('GACCOUNT');
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
