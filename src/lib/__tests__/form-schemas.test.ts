import {
  stellarAddressSchema,
  signinSchema,
  signupSchema,
  policyPurchaseSchema,
  policyPurchaseSchemaAsync,
  claimSchema,
  setClaimPolicy,
  createClaimSchema,
  proposalSchema,
  CLAIM_EVIDENCE_MAX_BYTES,
} from '@/lib/form-schemas';
import { validateWalletFunded } from '@/lib/walletValidation';

jest.mock('@/lib/walletValidation', () => ({
  validateWalletFunded: jest.fn(),
}));

const mockValidateWalletFunded = validateWalletFunded as jest.Mock;

const VALID_ADDRESS = 'G' + 'A'.repeat(55);

function makeFile(name: string, type: string, size = 1024): File {
  const bytes = new Uint8Array(size);
  return new File([bytes], name, { type });
}

describe('stellarAddressSchema', () => {
  it('accepts a valid Stellar address', () => {
    expect(stellarAddressSchema.safeParse(VALID_ADDRESS).success).toBe(true);
  });

  it('rejects addresses with invalid format', () => {
    for (const bad of ['', 'not-an-address', 'G' + 'A'.repeat(54), 'G' + '1'.repeat(55), 'H' + 'A'.repeat(55)]) {
      const result = stellarAddressSchema.safeParse(bad);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/valid Stellar address/i);
      }
    }
  });
});

describe('signinSchema', () => {
  it('accepts valid credentials', () => {
    expect(signinSchema.safeParse({ email: 'user@example.com', password: 'secret' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = signinSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('email');
    }
  });

  it('requires a password', () => {
    const result = signinSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Password is required/i);
    }
  });
});

describe('signupSchema', () => {
  const valid = { email: 'user@example.com', password: 'Passw0rd', confirmPassword: 'Passw0rd' };

  it('accepts valid credentials with matching passwords', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects passwords that do not match', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'Passw0rd!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('confirmPassword');
      expect(result.error.issues[0].message).toMatch(/do not match/i);
    }
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = signupSchema.safeParse({ ...valid, password: 'Pa1', confirmPassword: 'Pa1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /8 characters/i.test(i.message))).toBe(true);
    }
  });

  it('rejects passwords without a number', () => {
    const result = signupSchema.safeParse({ ...valid, password: 'Password', confirmPassword: 'Password' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /number/i.test(i.message))).toBe(true);
    }
  });

  it('rejects passwords without an uppercase letter', () => {
    const result = signupSchema.safeParse({ ...valid, password: 'password1', confirmPassword: 'password1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /uppercase/i.test(i.message))).toBe(true);
    }
  });
});

describe('policyPurchaseSchema', () => {
  it('accepts a valid address and accepted terms', () => {
    expect(policyPurchaseSchema.safeParse({ walletAddress: VALID_ADDRESS, agreeToTerms: true }).success).toBe(true);
  });

  it('rejects an invalid wallet address', () => {
    const result = policyPurchaseSchema.safeParse({ walletAddress: 'nope', agreeToTerms: true });
    expect(result.success).toBe(false);
  });

  it('rejects unchecked terms', () => {
    const result = policyPurchaseSchema.safeParse({ walletAddress: VALID_ADDRESS, agreeToTerms: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('agreeToTerms');
    }
  });
});

describe('policyPurchaseSchemaAsync', () => {
  const valid = { walletAddress: VALID_ADDRESS, agreeToTerms: true };

  beforeEach(() => {
    mockValidateWalletFunded.mockReset();
  });

  it('accepts a funded wallet', async () => {
    mockValidateWalletFunded.mockResolvedValue({ funded: true, balance: '500' });
    const result = await policyPurchaseSchemaAsync.safeParseAsync(valid);
    expect(result.success).toBe(true);
    expect(mockValidateWalletFunded).toHaveBeenCalledWith(VALID_ADDRESS);
  });

  it('rejects an unfunded wallet', async () => {
    mockValidateWalletFunded.mockResolvedValue({ funded: false });
    const result = await policyPurchaseSchemaAsync.safeParseAsync(valid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('walletAddress');
      expect(result.error.issues[0].message).toMatch(/must be funded/i);
    }
  });

  it('rejects an account that does not exist on the network', async () => {
    mockValidateWalletFunded.mockResolvedValue({
      funded: false,
      error: 'Account not found on network (unfunded)',
    });
    const result = await policyPurchaseSchemaAsync.safeParseAsync(valid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/unfunded/i);
    }
  });

  it('fails open when Horizon is unreachable', async () => {
    mockValidateWalletFunded.mockResolvedValue({
      funded: false,
      error: 'Network request to Horizon failed',
    });
    const result = await policyPurchaseSchemaAsync.safeParseAsync(valid);
    expect(result.success).toBe(true);
  });
});

describe('claimSchema', () => {
  const valid = {
    policyId: 'POLICY-1',
    amount: '250',
    description: 'A genuine incident occurred and needs to be covered by the policy.',
    evidence: makeFile('proof.pdf', 'application/pdf'),
  };

  afterEach(() => {
    setClaimPolicy(null);
  });

  it('accepts a valid claim', () => {
    expect(claimSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a claim without evidence', () => {
    expect(claimSchema.safeParse({ ...valid, evidence: null }).success).toBe(true);
  });

  it('enforces the lazily-provided policy coverage limit', () => {
    setClaimPolicy({ coverageLimit: 100, coverageLimitFormatted: '$100' });
    const result = claimSchema.safeParse({ ...valid, amount: '200' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('amount');
      expect(result.error.issues[0].message).toMatch(/cannot exceed/i);
    }
  });

  it('does not enforce a coverage limit when no policy is set', () => {
    expect(claimSchema.safeParse({ ...valid, amount: '999999' }).success).toBe(true);
  });

  it('allows amounts at or below the coverage limit', () => {
    setClaimPolicy({ coverageLimit: 100, coverageLimitFormatted: '$100' });
    expect(claimSchema.safeParse({ ...valid, amount: '100' }).success).toBe(true);
    expect(claimSchema.safeParse({ ...valid, amount: '50' }).success).toBe(true);
  });

  it('requires a policy to be selected', () => {
    const result = claimSchema.safeParse({ ...valid, policyId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('policyId');
    }
  });

  it('rejects non-positive amounts', () => {
    for (const amount of ['0', '-5']) {
      const result = claimSchema.safeParse({ ...valid, amount });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => /greater than 0/i.test(i.message))).toBe(true);
      }
    }
  });

  it('rejects a description shorter than 20 characters', () => {
    const result = claimSchema.safeParse({ ...valid, description: 'too short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /20 characters/i.test(i.message))).toBe(true);
    }
  });

  it('rejects disallowed file types', () => {
    const result = claimSchema.safeParse({ ...valid, evidence: makeFile('proof.txt', 'text/plain') });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /PDF, PNG or JPG/i.test(i.message))).toBe(true);
    }
  });

  it('rejects evidence files larger than the limit', () => {
    const result = claimSchema.safeParse({
      ...valid,
      evidence: makeFile('big.pdf', 'application/pdf', CLAIM_EVIDENCE_MAX_BYTES + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /10MB or smaller/i.test(i.message))).toBe(true);
    }
  });
});

describe('createClaimSchema', () => {
  const base = {
    policyId: 'POLICY-1',
    amount: '250',
    description: 'A genuine incident occurred and needs to be covered by the policy.',
    evidence: null,
  };

  it('returns the base schema when no policy is provided', () => {
    expect(createClaimSchema().safeParse({ ...base, amount: '999999' }).success).toBe(true);
  });

  it('rejects amounts exceeding the policy coverage limit', () => {
    const schema = createClaimSchema({ coverageLimit: 100, coverageLimitFormatted: '$100' });
    const result = schema.safeParse({ ...base, amount: '200' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('amount');
      expect(result.error.issues[0].message).toMatch(/cannot exceed/i);
    }
  });

  it('accepts amounts within the policy coverage limit', () => {
    const schema = createClaimSchema({ coverageLimit: 100 });
    expect(schema.safeParse({ ...base, amount: '50' }).success).toBe(true);
  });
});

describe('proposalSchema', () => {
  const valid = {
    title: 'Increase coverage limit',
    description: 'Raise the standard coverage limit to reflect market conditions.',
    type: 'FUNDING',
  };

  it('accepts a valid proposal', () => {
    expect(proposalSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a title shorter than 5 characters', () => {
    const result = proposalSchema.safeParse({ ...valid, title: 'Nope' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('title');
    }
  });

  it('rejects a description shorter than 10 characters', () => {
    const result = proposalSchema.safeParse({ ...valid, description: 'too short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('description');
    }
  });

  it('rejects an unknown proposal type', () => {
    const result = proposalSchema.safeParse({ ...valid, type: 'INVALID' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('type');
    }
  });
});