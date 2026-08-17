"use client";

import React from "react";
<<<<<<< HEAD
import { VoteType } from "@/types/api";
=======
import { VoteType } from "@/types/proposal";
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)

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
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`py-3 rounded-lg border transition-all ${
        selected
          ? `${activeColor} border-current`
          : "bg-[#0A0F1F] border-gray-700 text-gray-400 hover:border-gray-500"
      }`}
    >
      <div className="flex flex-col items-center">
        <span aria-hidden="true">{icon}</span>
        <span className="text-sm mt-1">{label}</span>
      </div>
    </button>
  );
}
