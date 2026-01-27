import React from "react";

interface VoteProgressBarProps {
  percentage: string;
  votes: number;
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}

export default function VoteProgressBar({
  percentage,
  votes,
  color,
  label,
  icon,
  bgColor,
}: VoteProgressBarProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className={`flex items-center gap-2 ${color}`}>
          {icon}
          {label}
        </span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${bgColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 mt-1 block">
        {votes.toLocaleString()} votes
      </span>
    </div>
  );
}
