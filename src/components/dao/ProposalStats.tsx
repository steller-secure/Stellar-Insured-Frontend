import React from "react";
import { Vote, CheckCircle2, TrendingUp, LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-[#1A1F35] rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface ProposalStatsProps {
  activeProposals: number;
  votedProposals: number;
  totalVotingPower: number;
}

export default function ProposalStats({
  activeProposals,
  votedProposals,
  totalVotingPower,
}: ProposalStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        icon={Vote}
        value={activeProposals}
        label="Active Proposals"
        iconBgColor="bg-[#22BBF9]/20"
        iconColor="text-[#22BBF9]"
      />

      <StatCard
        icon={CheckCircle2}
        value={votedProposals}
        label="Your Votes"
        iconBgColor="bg-[#B6FA9E]/20"
        iconColor="text-[#B6FA9E]"
      />

      <StatCard
        icon={TrendingUp}
        value={totalVotingPower}
        label="Voting Power"
        iconBgColor="bg-purple-500/20"
        iconColor="text-purple-400"
      />
    </div>
  );
}
