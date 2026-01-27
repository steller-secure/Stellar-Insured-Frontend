"use client";

import React from "react";
import { VoteType } from "@/types/dao-types";

interface VotingButtonProps {
  voteType: VoteType;
  selected: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  activeColor: string;
}

export default function VotingButton({
  selected,
  icon,
  label,
  onClick,
  activeColor,
}: VotingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`py-3 rounded-lg border transition-all ${
        selected
          ? `${activeColor} border-current`
          : "bg-[#0A0F1F] border-gray-700 text-gray-400 hover:border-gray-500"
      }`}
    >
      <div className="flex flex-col items-center">
        {icon}
        <span className="text-sm mt-1">{label}</span>
      </div>
    </button>
  );
}
