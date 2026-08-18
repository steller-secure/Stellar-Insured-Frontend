import { proposalService } from '../services/proposalService';

describe('Proposal Service', () => {
  it('creates a proposal', async () => {
    const proposal = await proposalService.createProposal({
      title: 'Test Proposal',
      description: 'Testing',
      type: 'UPGRADE',
      proposer: 'user1',
      proposerName: 'User 1',
    });
    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe('pending');
  });

  it('updates a proposal', async () => {
    const proposal = await proposalService.createProposal({
      title: 'Update Proposal',
      description: 'Testing update',
      type: 'FUNDING',
      proposer: 'user2',
      proposerName: 'User 2',
    });
    const updated = await proposalService.updateProposal(proposal.id, { status: 'active' });
    expect(updated?.status).toBe('active');
  });
});
