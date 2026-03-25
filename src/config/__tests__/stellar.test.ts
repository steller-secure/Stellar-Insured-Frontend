/**
 * Tests for Stellar network configuration.
 */

describe('stellar config', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        delete process.env[key];
      }
    });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function loadStellarConfig() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/config/stellar') as typeof import('@/config/stellar');
  }

  describe('default (testnet)', () => {
    it('uses testnet Horizon URL', () => {
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.horizonUrl).toBe('https://horizon-testnet.stellar.org');
    });

    it('uses testnet network passphrase', () => {
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.networkPassphrase).toBe('Test SDF Network ; September 2015');
    });

    it('uses testnet explorer URL', () => {
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.explorerUrl).toContain('testnet');
    });

    it('has correct networkId', () => {
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.networkId).toBe('testnet');
    });

    it('provides valid tx explorer path', () => {
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.explorerTxPath).toContain('/tx');
    });

    it('provides valid account explorer path', () => {
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.explorerAccountPath).toContain('/account');
    });
  });

  describe('mainnet', () => {
    it('switches to mainnet when env var is set', () => {
      process.env.NEXT_PUBLIC_STELLAR_NETWORK = 'mainnet';
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.networkId).toBe('mainnet');
      expect(stellarConfig.horizonUrl).toBe('https://horizon.stellar.org');
      expect(stellarConfig.networkPassphrase).toBe(
        'Public Global Stellar Network ; September 2015'
      );
    });

    it('uses public explorer for mainnet', () => {
      process.env.NEXT_PUBLIC_STELLAR_NETWORK = 'mainnet';
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.explorerUrl).toContain('public');
    });
  });

  describe('custom overrides', () => {
    it('uses custom Horizon URL when provided', () => {
      process.env.NEXT_PUBLIC_HORIZON_URL = 'https://custom-horizon.example.com';
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.horizonUrl).toBe('https://custom-horizon.example.com');
    });

    it('uses custom Explorer URL when provided', () => {
      process.env.NEXT_PUBLIC_EXPLORER_URL = 'https://custom-explorer.example.com';
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.explorerUrl).toBe('https://custom-explorer.example.com');
      expect(stellarConfig.explorerTxPath).toBe('https://custom-explorer.example.com/tx');
      expect(stellarConfig.explorerAccountPath).toBe('https://custom-explorer.example.com/account');
    });

    it('falls back to testnet for unknown network value', () => {
      process.env.NEXT_PUBLIC_STELLAR_NETWORK = 'invalidnet';
      const { stellarConfig } = loadStellarConfig();
      expect(stellarConfig.networkId).toBe('testnet');
    });
  });
});
