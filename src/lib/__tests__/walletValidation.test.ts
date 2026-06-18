import {
  isValidStellarAddress,
  validateSessionWallet,
  validateWalletFunded,
  validateSessionFields,
} from "@/lib/walletValidation";
import type { AuthSession } from "@/store/types";

// Valid 56-char Stellar address (G + 55 base32 chars)
const VALID_ADDR = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";
const ANOTHER_VALID_ADDR = "GBVVKSMVMZAAWVQBYJAXAGSRKFAPGBRSM7PIZACPJNUQKWKTLQ7VHSOA";

// ── isValidStellarAddress ───────────────────────────────────────────────────

describe("isValidStellarAddress", () => {
  it("accepts a valid Stellar G-address", () => {
    expect(isValidStellarAddress(VALID_ADDR)).toBe(true);
  });

  it("rejects an address that does not start with G", () => {
    expect(isValidStellarAddress("B" + VALID_ADDR.slice(1))).toBe(false);
  });

  it("rejects an address that is too short", () => {
    expect(isValidStellarAddress("GAAZI4TCR")).toBe(false);
  });

  it("rejects an address with invalid characters (digit 0)", () => {
    // Replace last char with '0' which is not valid base32
    expect(isValidStellarAddress(VALID_ADDR.slice(0, -1) + "0")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidStellarAddress("")).toBe(false);
  });
});

// ── validateSessionFields ───────────────────────────────────────────────────

const validSession: AuthSession = {
  address: VALID_ADDR,
  signedMessage: "abc123",
  signerAddress: VALID_ADDR,
  authenticatedAt: Date.now() - 1000,
  expiresAt: Date.now() + 86400000,
};

describe("validateSessionFields", () => {
  it("returns true for a valid session", () => {
    expect(validateSessionFields(validSession)).toBe(true);
  });

  it("rejects null", () => {
    expect(validateSessionFields(null)).toBe(false);
  });

  it("rejects a session with invalid address", () => {
    expect(validateSessionFields({ ...validSession, address: "invalid" })).toBe(false);
  });

  it("rejects a session with empty signedMessage", () => {
    expect(validateSessionFields({ ...validSession, signedMessage: "" })).toBe(false);
  });

  it("rejects a session with invalid signerAddress", () => {
    expect(validateSessionFields({ ...validSession, signerAddress: "bad" })).toBe(false);
  });

  it("rejects a session missing authenticatedAt", () => {
    const { authenticatedAt: _, ...rest } = validSession;
    expect(validateSessionFields(rest)).toBe(false);
  });

  it("rejects an expired session", () => {
    expect(validateSessionFields({ ...validSession, expiresAt: Date.now() - 10000 })).toBe(false);
  });
});

// ── validateSessionWallet ───────────────────────────────────────────────────

jest.mock("@stellar/freighter-api", () => ({
  isConnected: jest.fn(),
  requestAccess: jest.fn(),
}));

import { isConnected, requestAccess } from "@stellar/freighter-api";

const mockIsConnected = isConnected as jest.MockedFunction<typeof isConnected>;
const mockRequestAccess = requestAccess as jest.MockedFunction<typeof requestAccess>;

describe("validateSessionWallet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns valid:true when freighter address matches session address", async () => {
    mockIsConnected.mockResolvedValue({ isConnected: true } as any);
    mockRequestAccess.mockResolvedValue({ address: VALID_ADDR } as any);

    const result = await validateSessionWallet({ ...validSession, address: VALID_ADDR });
    expect(result.valid).toBe(true);
  });

  it("returns valid:false when wallet is not connected", async () => {
    mockIsConnected.mockResolvedValue({ isConnected: false } as any);

    const result = await validateSessionWallet(validSession);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not connected/i);
  });

  it("returns valid:false when addresses mismatch", async () => {
    mockIsConnected.mockResolvedValue({ isConnected: true } as any);
    mockRequestAccess.mockResolvedValue({ address: ANOTHER_VALID_ADDR } as any);

    const result = await validateSessionWallet({ ...validSession, address: VALID_ADDR });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mismatch/i);
  });

  it("returns valid:false when isConnected returns an error", async () => {
    mockIsConnected.mockResolvedValue({ error: "extension not found" } as any);

    const result = await validateSessionWallet(validSession);
    expect(result.valid).toBe(false);
  });
});

// ── validateWalletFunded ────────────────────────────────────────────────────

describe("validateWalletFunded", () => {
  afterEach(() => {
    // @ts-expect-error reset mock
    delete global.fetch;
  });

  it("returns funded:false for an invalid address", async () => {
    const result = await validateWalletFunded("bad-address");
    expect(result.funded).toBe(false);
    expect(result.error).toMatch(/invalid/i);
  });

  it("returns funded:false for a 404 (unfunded account)", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404, ok: false } as any);

    const result = await validateWalletFunded(VALID_ADDR);
    expect(result.funded).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });

  it("returns funded:true when account has XLM balance", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        balances: [{ asset_type: "native", balance: "100.0000000" }],
      }),
    } as any);

    const result = await validateWalletFunded(VALID_ADDR);
    expect(result.funded).toBe(true);
    expect(result.balance).toBe("100.0000000");
  });

  it("returns funded:false when account has zero XLM balance", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        balances: [{ asset_type: "native", balance: "0.0000000" }],
      }),
    } as any);

    const result = await validateWalletFunded(VALID_ADDR);
    expect(result.funded).toBe(false);
  });
});
