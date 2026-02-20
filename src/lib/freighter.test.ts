import { connectFreighter, signFreighterMessage, createAuthMessage } from '@/lib/freighter';
import * as freighterApi from '@stellar/freighter-api';

jest.mock('@stellar/freighter-api');

describe('freighter utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connectFreighter', () => {
    it('connects successfully and returns address', async () => {
      (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
      (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: 'GTEST123' });

      const address = await connectFreighter();

      expect(address).toBe('GTEST123');
      expect(freighterApi.isConnected).toHaveBeenCalled();
      expect(freighterApi.requestAccess).toHaveBeenCalled();
    });

    it('throws error when wallet not connected', async () => {
      (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: false });

      await expect(connectFreighter()).rejects.toThrow('Freighter wallet extension not detected');
    });

    it('throws error when connection fails', async () => {
      (freighterApi.isConnected as jest.Mock).mockResolvedValue({ error: 'Connection failed' });

      await expect(connectFreighter()).rejects.toThrow('Connection failed');
    });

    it('throws error when no address returned', async () => {
      (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
      (freighterApi.requestAccess as jest.Mock).mockResolvedValue({});

      await expect(connectFreighter()).rejects.toThrow('Unable to retrieve wallet address');
    });
  });

  describe('signFreighterMessage', () => {
    it('signs message successfully', async () => {
      (freighterApi.signMessage as jest.Mock).mockResolvedValue({
        signedMessage: 'signed_message',
        signerAddress: 'GTEST123'
      });

      const result = await signFreighterMessage('GTEST123', 'test message');

      expect(result).toEqual({
        signedMessage: 'signed_message',
        signerAddress: 'GTEST123'
      });
      expect(freighterApi.signMessage).toHaveBeenCalledWith('test message', { address: 'GTEST123' });
    });

    it('handles Uint8Array signed message', async () => {
      const uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
      (freighterApi.signMessage as jest.Mock).mockResolvedValue({
        signedMessage: uint8Array,
        signerAddress: 'GTEST123'
      });

      const result = await signFreighterMessage('GTEST123', 'test');

      expect(result.signerAddress).toBe('GTEST123');
      expect(typeof result.signedMessage).toBe('string');
    });

    it('throws error on signing failure', async () => {
      (freighterApi.signMessage as jest.Mock).mockResolvedValue({ error: 'User rejected' });

      await expect(signFreighterMessage('GTEST123', 'test')).rejects.toThrow('User rejected');
    });
  });

  describe('createAuthMessage', () => {
    it('creates auth message with required fields', () => {
      const result = createAuthMessage('GTEST123');

      expect(result.message).toContain('Stellar Insured Authentication');
      expect(result.message).toContain('GTEST123');
      expect(result.message).toContain('Nonce:');
      expect(result.message).toContain('Issued At:');
      expect(result.nonce).toHaveLength(32);
      expect(result.issuedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('generates unique nonces', () => {
      const result1 = createAuthMessage('GTEST123');
      const result2 = createAuthMessage('GTEST123');

      expect(result1.nonce).not.toBe(result2.nonce);
    });
  });
});
