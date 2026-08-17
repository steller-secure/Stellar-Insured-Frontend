import { proposalService } from '../services/proposalService';

describe('Proposal Service', () => {
<<<<<<< HEAD
  it('creates a proposal', async () => {
    const proposal = await proposalService.createProposal({
      title: 'Test Proposal',
      description: 'Testing',
      type: 'UPGRADE',
      proposer: 'user1',
      proposerName: 'User 1',
=======
  it('creates a proposal', () => {
    const proposal = proposalService.createProposal({
      title: 'Test Upgrade Proposal',
      description: 'UPGRADE proposal',
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
    });
    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe('pending');
  });

<<<<<<< HEAD
  it('updates a proposal', async () => {
    const proposal = await proposalService.createProposal({
      title: 'Update Proposal',
      description: 'Testing update',
      type: 'FUNDING',
      proposer: 'user2',
      proposerName: 'User 2',
    });
    const updated = await proposalService.updateProposal(proposal.id, { status: 'active' });
=======
  it('updates a proposal', () => {
    const proposal = proposalService.createProposal({
      title: 'Test Funding Proposal',
      description: 'FUNDING proposal',
    });
    const updated = proposalService.updateProposal(proposal.id, { status: 'active' });
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
    expect(updated?.status).toBe('active');
  });
});