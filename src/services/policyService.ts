import type {
  Policy,
  PolicyCreationRequest,
  PolicyUpdateRequest,
  PolicyValidationResult,
  PremiumCalculationRequest,
  PremiumCalculationResult,
  PolicyFilterOptions,
  PolicyServiceResponse,
  PolicyListResponse,
  PolicyStatistics,
  PolicyType,
} from './types/policy.types';
import { blockchainEvents, type BlockchainEvent } from '@/lib/blockchainEvents';

import { DataService } from '@/config/dataSource';

class PolicyService {
  subscribe(listener: (event: BlockchainEvent) => void) {
    return blockchainEvents.subscribe(listener, ['policy.purchased', 'policy.updated']);
  }

  async getPolicies(options?: PolicyFilterOptions): Promise<PolicyServiceResponse<PolicyListResponse>> {
    try {
      let filteredPolicies = await DataService.getPolicies();

      // Apply filters
      if (options) {
        if (options.status) {
          filteredPolicies = filteredPolicies.filter((p) => p.status === options.status);
        }
        if (options.type) {
          filteredPolicies = filteredPolicies.filter((p) => p.type === options.type);
        }
        if (options.searchQuery) {
          const query = options.searchQuery.toLowerCase();
          filteredPolicies = filteredPolicies.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.policyNumber.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query),
          );
        }

        // Apply sorting
        if (options.sortBy) {
          filteredPolicies.sort((a, b) => {
            const aValue = (a as any)[options.sortBy!];
            const bValue = (b as any)[options.sortBy!];
            if (aValue === undefined || bValue === undefined) return 0;
            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return options.sortOrder === 'desc' ? -comparison : comparison;
          });
        }
      }

      const response: PolicyListResponse = {
        policies: filteredPolicies,
        totalCount: filteredPolicies.length,
        currentPage: 1,
        totalPages: 1,
      };

      return {
        data: response,
        success: true,
        message: 'Policies retrieved successfully',
      };
    } catch (error) {
      return {
        data: { policies: [], totalCount: 0, currentPage: 1, totalPages: 1 },
        success: false,
        error: 'Failed to retrieve policies',
      };
    }
  }

  async getPolicyById(id: string): Promise<PolicyServiceResponse<Policy | null>> {
    try {
      const policy = await DataService.getPolicy(id);

      if (!policy) {
        return {
          data: null,
          success: false,
          error: 'Policy not found',
        };
      }

      return {
        data: policy,
        success: true,
        message: 'Policy retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to retrieve policy',
      };
    }
  }

  async createPolicy(request: PolicyCreationRequest): Promise<PolicyServiceResponse<Policy | null>> {
    try {
      const validation = this.validatePolicyCreationRequest(request);
      if (!validation.isValid) {
        return {
          data: null,
          success: false,
          error: validation.errors.join(', '),
        };
      }

      const newPolicy: Policy = {
        id: `p${Date.now()}`,
        name: request.name,
        type: request.type,
        status: 'pending',
        coverageLimit: request.coverageLimit,
        coverageLimitFormatted: this.formatCurrency(request.coverageLimit),
        policyNumber: this.generatePolicyNumber(request.type),
        description: request.description,
        terms: request.terms,
        premium: await this.calculatePremium({
          policyType: request.type,
          coverageLimit: request.coverageLimit,
        }).then((r) => r.finalPremium),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await DataService.createPolicy(newPolicy);

      return {
        data: newPolicy,
        success: true,
        message: 'Policy created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to create policy',
      };
    }
  }

  async updatePolicy(id: string, request: PolicyUpdateRequest): Promise<PolicyServiceResponse<Policy | null>> {
    try {
      const currentPolicy = await DataService.getPolicy(id);

      if (!currentPolicy) {
        return {
          data: null,
          success: false,
          error: 'Policy not found',
        };
      }

      const updatedPolicy: Policy = {
        ...currentPolicy,
        ...request,
        updatedAt: new Date().toISOString(),
      };

      if (request.coverageLimit) {
        updatedPolicy.coverageLimitFormatted = this.formatCurrency(request.coverageLimit);
      }

      if (request.coverageLimit || request.type) {
        updatedPolicy.premium = await this.calculatePremium({
          policyType: updatedPolicy.type,
          coverageLimit: updatedPolicy.coverageLimit,
        }).then((r) => r.finalPremium);
      }

      await DataService.updatePolicy(id, updatedPolicy);

      return {
        data: updatedPolicy,
        success: true,
        message: 'Policy updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to update policy',
      };
    }
  }

  async calculatePremium(request: PremiumCalculationRequest): Promise<PremiumCalculationResult> {
    try {
      const baseRates: Record<PolicyType, number> = {
        Health: 0.005,
        Auto: 0.008,
        Home: 0.003,
        Travel: 0.004,
      } as const;

      const baseRate = baseRates[request.policyType];
      let riskMultiplier = 1.0;

      if (request.riskFactors) {
        if (request.riskFactors.claimsHistory && request.riskFactors.claimsHistory > 2) {
          riskMultiplier += 0.2;
        }
        if (request.riskFactors.creditScore && request.riskFactors.creditScore < 600) {
          riskMultiplier += 0.15;
        }
        if (request.riskFactors.age && request.riskFactors.age < 25) {
          riskMultiplier += 0.1;
        }
      }

      const basePremium = request.coverageLimit * baseRate;
      const riskComponent = basePremium * (riskMultiplier - 1);
      const fees = 50;
      const finalPremium = basePremium * riskMultiplier + fees;

      return {
        basePremium,
        finalPremium,
        riskMultiplier,
        breakdown: {
          coverageComponent: basePremium,
          riskComponent,
          fees,
        },
      };
    } catch (error) {
      throw new Error('Failed to calculate premium');
    }
  }

  validatePolicyCreationRequest(request: PolicyCreationRequest): PolicyValidationResult {
    const errors: string[] = [];

    if (!request.name || request.name.trim().length < 3) {
      errors.push('Policy name must be at least 3 characters long');
    }

    const validTypes: PolicyType[] = ['Health', 'Auto', 'Home', 'Travel'];
    if (!validTypes.includes(request.type)) {
      errors.push('Invalid policy type');
    }

    if (!request.coverageLimit || request.coverageLimit < 1000) {
      errors.push('Coverage limit must be at least $1,000');
    }

    if (request.coverageLimit > 10000000) {
      errors.push('Coverage limit cannot exceed $10,000,000');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getPolicyStatistics(): Promise<PolicyServiceResponse<PolicyStatistics>> {
    try {
      const policiesToStat = await DataService.getPolicies();

      const totalPolicies = policiesToStat.length;
      const activePolicies = policiesToStat.filter((p) => p.status === 'active').length;
      const pendingPolicies = policiesToStat.filter((p) => p.status === 'pending').length;
      const expiredPolicies = policiesToStat.filter((p) => p.status === 'expired').length;
      const totalCoverage = policiesToStat.reduce((sum, p) => sum + p.coverageLimit, 0);
      const averagePremium = totalPolicies > 0 ? policiesToStat.reduce((sum, p) => sum + (p.premium || 0), 0) / totalPolicies : 0;

      return {
        data: {
          totalPolicies,
          activePolicies,
          pendingPolicies,
          expiredPolicies,
          totalCoverage,
          averagePremium,
        },
        success: true,
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: {
          totalPolicies: 0,
          activePolicies: 0,
          pendingPolicies: 0,
          expiredPolicies: 0,
          totalCoverage: 0,
          averagePremium: 0,
        },
        success: false,
        error: 'Failed to retrieve statistics',
      };
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  private generatePolicyNumber(type: PolicyType): string {
    const prefixes: Record<PolicyType, string> = {
      Health: 'HEL',
      Auto: 'AUT',
      Home: 'HOM',
      Travel: 'TRV',
    } as const;

    const prefix = prefixes[type];
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}-XX`;
  }
}

export const policyService = new PolicyService();
export { PolicyService };
