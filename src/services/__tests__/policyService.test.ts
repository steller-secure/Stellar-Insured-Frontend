import { PolicyService } from '../policyService';
import type { PolicyCreationRequest, PremiumCalculationRequest } from '../types/policy.types';

describe('PolicyService', () => {
  let policyService: PolicyService;

  beforeEach(() => {
    policyService = new PolicyService();
  });

  describe('getPolicies', () => {
    it('should return all policies when no options provided', async () => {
      const result = await policyService.getPolicies();
      
      expect(result.success).toBe(true);
      expect(result.data.policies).toHaveLength(3);
      expect(result.data.totalCount).toBe(3);
    });

    it('should filter policies by status', async () => {
      const result = await policyService.getPolicies({ status: 'active' });
      
      expect(result.success).toBe(true);
      expect(result.data.policies.every(p => p.status === 'active')).toBe(true);
    });

    it('should filter policies by type', async () => {
      const result = await policyService.getPolicies({ type: 'Health' });
      
      expect(result.success).toBe(true);
      expect(result.data.policies.every(p => p.type === 'Health')).toBe(true);
    });

    it('should search policies by name', async () => {
      const result = await policyService.getPolicies({ searchQuery: 'Health' });
      
      expect(result.success).toBe(true);
      expect(result.data.policies.some(p => p.name.includes('Health'))).toBe(true);
    });

    it('should sort policies by name', async () => {
      const result = await policyService.getPolicies({ 
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      expect(result.success).toBe(true);
      const names = result.data.policies.map(p => p.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('getPolicyById', () => {
    it('should return policy when valid ID provided', async () => {
      const result = await policyService.getPolicyById('p1');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('p1');
      expect(result.data?.name).toBe('Comprehensive Health Plan');
    });

    it('should return null when invalid ID provided', async () => {
      const result = await policyService.getPolicyById('invalid-id');
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Policy not found');
    });
  });

  describe('createPolicy', () => {
    const validRequest: PolicyCreationRequest = {
      name: 'Test Policy',
      type: 'Health',
      coverageLimit: 10000,
      description: 'Test policy description',
      terms: ['Term 1', 'Term 2']
    };

    it('should create policy with valid request', async () => {
      const result = await policyService.createPolicy(validRequest);
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(validRequest.name);
      expect(result.data?.type).toBe(validRequest.type);
      expect(result.data?.status).toBe('pending');
      expect(result.data?.policyNumber).toMatch(/^HEL-\w{4}-XX$/);
    });

    it('should reject policy with short name', async () => {
      const invalidRequest = { ...validRequest, name: 'AB' };
      const result = await policyService.createPolicy(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Policy name must be at least 3 characters long');
    });

    it('should reject policy with invalid type', async () => {
      const invalidRequest = { ...validRequest, type: 'Invalid' as any };
      const result = await policyService.createPolicy(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid policy type');
    });

    it('should reject policy with low coverage limit', async () => {
      const invalidRequest = { ...validRequest, coverageLimit: 500 };
      const result = await policyService.createPolicy(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Coverage limit must be at least $1,000');
    });

    it('should reject policy with excessive coverage limit', async () => {
      const invalidRequest = { ...validRequest, coverageLimit: 20000000 };
      const result = await policyService.createPolicy(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Coverage limit cannot exceed $10,000,000');
    });
  });

  describe('updatePolicy', () => {
    it('should update existing policy', async () => {
      const updateRequest = {
        name: 'Updated Policy Name',
        status: 'active' as const
      };
      
      const result = await policyService.updatePolicy('p1', updateRequest);
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(updateRequest.name);
      expect(result.data?.status).toBe(updateRequest.status);
    });

    it('should return error for non-existent policy', async () => {
      const updateRequest = { name: 'Updated Name' };
      const result = await policyService.updatePolicy('invalid-id', updateRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Policy not found');
    });

    it('should update coverage limit and formatted amount', async () => {
      const updateRequest = { coverageLimit: 75000 };
      const result = await policyService.updatePolicy('p1', updateRequest);
      
      expect(result.success).toBe(true);
      expect(result.data?.coverageLimit).toBe(75000);
      expect(result.data?.coverageLimitFormatted).toBe('$75,000.00');
    });
  });

  describe('calculatePremium', () => {
    const baseRequest: PremiumCalculationRequest = {
      policyType: 'Health',
      coverageLimit: 50000
    };

    it('should calculate premium for health policy', async () => {
      const result = await policyService.calculatePremium(baseRequest);
      
      expect(result.basePremium).toBe(250); // 50000 * 0.005
      expect(result.finalPremium).toBe(300); // 250 + 50 fees
      expect(result.riskMultiplier).toBe(1.0);
      expect(result.breakdown.coverageComponent).toBe(250);
      expect(result.breakdown.riskComponent).toBe(0);
      expect(result.breakdown.fees).toBe(50);
    });

    it('should calculate premium for auto policy', async () => {
      const request = { ...baseRequest, policyType: 'Auto' as const };
      const result = await policyService.calculatePremium(request);
      
      expect(result.basePremium).toBe(400); // 50000 * 0.008
      expect(result.finalPremium).toBe(450); // 400 + 50 fees
    });

    it('should apply risk multiplier for claims history', async () => {
      const request = {
        ...baseRequest,
        riskFactors: { claimsHistory: 3 }
      };
      const result = await policyService.calculatePremium(request);
      
      expect(result.riskMultiplier).toBe(1.2);
      expect(result.breakdown.riskComponent).toBeCloseTo(50); // 250 * 0.2
    });

    it('should apply risk multiplier for low credit score', async () => {
      const request = {
        ...baseRequest,
        riskFactors: { creditScore: 550 }
      };
      const result = await policyService.calculatePremium(request);
      
      expect(result.riskMultiplier).toBe(1.15);
      expect(result.breakdown.riskComponent).toBeCloseTo(37.5); // 250 * 0.15
    });

    it('should apply multiple risk factors', async () => {
      const request = {
        ...baseRequest,
        riskFactors: { 
          claimsHistory: 3,
          creditScore: 550,
          age: 20
        }
      };
      const result = await policyService.calculatePremium(request);
      
      expect(result.riskMultiplier).toBe(1.45); // 1.0 + 0.2 + 0.15 + 0.1
    });
  });

  describe('getPolicyStatistics', () => {
    it('should return correct statistics', async () => {
      const result = await policyService.getPolicyStatistics();
      
      expect(result.success).toBe(true);
      expect(result.data.totalPolicies).toBe(3);
      expect(result.data.activePolicies).toBe(2);
      expect(result.data.pendingPolicies).toBe(1);
      expect(result.data.expiredPolicies).toBe(0);
      expect(result.data.totalCoverage).toBe(575000);
      expect(result.data.averagePremium).toBeCloseTo(266.67, 2);
    });
  });

  describe('validatePolicyCreationRequest', () => {
    it('should validate correct request', () => {
      const request: PolicyCreationRequest = {
        name: 'Valid Policy Name',
        type: 'Health',
        coverageLimit: 10000
      };
      
      const result = policyService.validatePolicyCreationRequest(request);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect multiple validation errors', () => {
      const request: PolicyCreationRequest = {
        name: 'AB',
        type: 'Invalid' as any,
        coverageLimit: 500
      };
      
      const result = policyService.validatePolicyCreationRequest(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
      expect(result.errors.some(e => e.includes('type'))).toBe(true);
      expect(result.errors.some(e => e.includes('coverage'))).toBe(true);
    });
  });
});
