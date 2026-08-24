import { proposalService } from '../services/proposalService';

describe('Proposal Service', () => {
  it('creates a proposal', () => {
    const proposal = proposalService.createProposal({
      title: 'Test Upgrade Proposal',
      description: 'UPGRADE proposal',
    });
    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe('pending');
  });

  it('updates a proposal', () => {
    const proposal = proposalService.createProposal({
      title: 'Test Funding Proposal',
      description: 'FUNDING proposal',
    });
    const updated = proposalService.updateProposal(proposal.id, { status: 'active' });
    expect(updated?.status).toBe('active');
  });
});
