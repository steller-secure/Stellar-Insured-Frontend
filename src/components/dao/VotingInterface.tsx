"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MinusCircle } from "lucide-react";
import { VoteType } from "@/types/dao-types";
import VotingButton from "./VotingButton";

interface VotingInterfaceProps {
  proposalId: string;
  userVotingPower: number;
  hasVoted: boolean;
  userVote: VoteType | null;
  onVote: (proposalId: string, voteType: VoteType) => Promise<void>;
}

export default function VotingInterface({
  proposalId,
  userVotingPower,
  hasVoted,
  userVote,
  onVote,
}: VotingInterfaceProps) {
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  /**
   * Handle vote submission
   */
  const handleVoteSubmit = async () => {
    if (!selectedVote || hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(proposalId, selectedVote);
    } catch (error) {
      console.error("Vote submission failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  // If user has already voted, show confirmation
  if (hasVoted && userVote) {
    return (
      <div className="border-t border-gray-700/50 pt-4">
        <div className="flex items-center justify-center gap-2 text-[#B6FA9E] py-3 bg-[#B6FA9E]/10 rounded-lg">
          <span className="font-medium">
            You voted: {userVote.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-700/50 pt-4">
      {/* Voting Power Display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Your Voting Power:</span>
        <span className="text-[#22BBF9] font-semibold">
          {userVotingPower} votes
        </span>
      </div>

      {/* Voting Options */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <VotingButton
          voteType="for"
          selected={selectedVote === "for"}
          icon={<ThumbsUp className="w-5 h-5" />}
          label="For"
          onClick={() => setSelectedVote("for")}
          activeColor="bg-[#B6FA9E]/20 text-[#B6FA9E]"
        />

        <VotingButton
          voteType="against"
          selected={selectedVote === "against"}
          icon={<ThumbsDown className="w-5 h-5" />}
          label="Against"
          onClick={() => setSelectedVote("against")}
          activeColor="bg-red-400/20 text-red-400"
        />

        <VotingButton
          voteType="abstain"
          selected={selectedVote === "abstain"}
          icon={<MinusCircle className="w-5 h-5" />}
          label="Abstain"
          onClick={() => setSelectedVote("abstain")}
          activeColor="bg-gray-400/20 text-gray-400"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleVoteSubmit}
        disabled={!selectedVote || isVoting}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          selectedVote && !isVoting
            ? "bg-[#22BBF9] text-white hover:bg-[#22BBF9]/90"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isVoting ? "Submitting Vote..." : "Cast Vote"}
      </button>
    </div>
  );
}
