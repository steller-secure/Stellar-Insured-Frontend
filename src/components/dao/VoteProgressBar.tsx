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
          {/* Icon is decorative; the text label conveys the meaning */}
          <span aria-hidden="true">{icon}</span>
          {label}
        </span>
        <span className="text-white font-medium" aria-hidden="true">{percentage}%</span>
      </div>
      <div
        className="w-full bg-gray-700 rounded-full h-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(percentage)}
        aria-label={`${label} votes: ${percentage}%`}
      >
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
