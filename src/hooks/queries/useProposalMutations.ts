'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Proposal, VoteType } from '@/types/api';
import { queryKeys } from './queryKeys';

function applyVote(proposal: Proposal, voteType: VoteType): Proposal {
  const voteAmount = proposal.userVotingPower;
  return {
    ...proposal,
    votesFor: voteType === 'for' ? proposal.votesFor + voteAmount : proposal.votesFor,
    votesAgainst: voteType === 'against' ? proposal.votesAgainst + voteAmount : proposal.votesAgainst,
    votesAbstain: voteType === 'abstain' ? proposal.votesAbstain + voteAmount : proposal.votesAbstain,
    totalVotes: proposal.totalVotes + voteAmount,
    hasVoted: true,
    userVote: voteType,
  };
}

interface CastVoteVariables {
  proposalId: string;
  voteType: VoteType;
}

/**
 * Cast a vote on a governance proposal. Simulates the on-chain transaction
 * delay (no daoApi.castVote() backend wiring yet — same scope boundary as
 * the policy purchase flow) with an optimistic vote-tally update, rolling
 * back if the simulated transaction fails.
 */
export function useCastVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, voteType }: CastVoteVariables) => {
      // Simulate blockchain transaction delay.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { proposalId, voteType };
    },
    onMutate: async ({ proposalId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.proposals.all });

      const previousLists = queryClient.getQueriesData<Proposal[]>({
        queryKey: queryKeys.proposals.all,
      });

      queryClient.setQueriesData<Proposal[]>({ queryKey: queryKeys.proposals.all }, (current) =>
        current?.map((proposal) =>
          proposal.id === proposalId ? applyVote(proposal, voteType) : proposal
        )
      );

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}
