"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  X,
  ChevronDown,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import {
  PolicyFilterState,
  CoverageType,
  ProviderId,
} from "@/types/policies/filter";
import {
  ALL_COVERAGE_TYPES,
  COVERAGE_TYPE_LABELS,
  ALL_PROVIDERS,
  PROVIDER_LABELS,
} from "@/types/policies/filter";

interface AdvancedFilterPanelProps {
  filterState: PolicyFilterState;
  activeFilterCount: number;
  onSearchChange: (query: string) => void;
  onCoverageTypeToggle: (type: CoverageType) => void;
  onProviderToggle: (provider: ProviderId) => void;
  onPremiumRangeChange: (range: { min: number; max: number }) => void;
  onDeductibleRangeChange: (range: { min: number; max: number }) => void;
  onClearAll: () => void;
}

interface RangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  minLabel: string;
  maxLabel?: string;
  step?: number;
  formatValue?: (value: number) => string;
}

function RangeSlider({
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
  step = 10,
  formatValue = (v) => `$${v}`,
}: RangeSliderProps) {
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), value.max - step);
      onChange({ ...value, min: newMin });
    },
    [value, onChange, step],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), value.min + step);
      onChange({ ...value, max: newMax });
    },
    [value, onChange, step],
  );

  const minPercent = ((value.min - min) / (max - min)) * 100;
  const maxPercent = ((value.max - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{minLabel}</span>
        <span className="text-white font-medium">
          {formatValue(value.min)} - {formatValue(value.max)}
        </span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 bg-slate-700 rounded-full" />
        <div
          className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.min}
          onChange={handleMinChange}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.max}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  counts?: Record<string, number>;
}

function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onToggle,
  counts,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-lg border transition-colors ${
          isOpen || selectedValues.length > 0
            ? "bg-slate-800 border-cyan-500 text-white"
            : "bg-transparent border-slate-700 text-slate-300 hover:border-slate-600"
        }`}
      >
        <span className="truncate">
          {selectedValues.length > 0
            ? `${label} (${selectedValues.length})`
            : label}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full min-w-[200px] rounded-md bg-slate-800 border border-slate-700 shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto text-sm">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onToggle(option.value);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between ${
                    selectedValues.includes(option.value)
                      ? "bg-slate-700 text-cyan-400"
                      : "text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                    />
                    {option.label}
                  </span>
                  {counts && counts[option.value] !== undefined && (
                    <span className="text-xs text-slate-500">
                      ({counts[option.value]})
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AdvancedFilterPanel({
  filterState,
  activeFilterCount,
  onSearchChange,
  onCoverageTypeToggle,
  onProviderToggle,
  onPremiumRangeChange,
  onDeductibleRangeChange,
  onClearAll,
}: AdvancedFilterPanelProps) {
  const [localSearch, setLocalSearch] = useState(filterState.searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearch, onSearchChange]);

  // Update local search when URL changes
  useEffect(() => {
    setLocalSearch(filterState.searchQuery);
  }, [filterState.searchQuery]);

  const coverageOptions = ALL_COVERAGE_TYPES.map((type) => ({
    value: type,
    label: COVERAGE_TYPE_LABELS[type],
  }));

  const providerOptions = ALL_PROVIDERS.map((provider) => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
  }));

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="w-full bg-[#0a1225] dark:bg-[#0a1225] border-b border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar Row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search policies by name or description..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1.5 h-10 px-3 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/30 hover:border-rose-500/50 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear All
              <span className="ml-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-rose-500/20 rounded-full">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Coverage Type Filter */}
          <MultiSelectDropdown
            label="Coverage Type"
            options={coverageOptions}
            selectedValues={filterState.coverageTypes}
            onToggle={(value) => onCoverageTypeToggle(value as CoverageType)}
          />

          {/* Provider Filter */}
          <MultiSelectDropdown
            label="Provider"
            options={providerOptions}
            selectedValues={filterState.providers}
            onToggle={(value) => onProviderToggle(value as ProviderId)}
          />

          {/* Premium Range */}
          <div className="w-full sm:w-auto">
            <RangeSlider
              min={0}
              max={1000}
              value={filterState.premiumRange}
              onChange={onPremiumRangeChange}
              minLabel="Premium"
              step={10}
              formatValue={(v) => `$${v}/mo`}
            />
          </div>

          {/* Deductible Range */}
          <div className="w-full sm:w-auto">
            <RangeSlider
              min={0}
              max={10000}
              value={filterState.deductibleRange}
              onChange={onDeductibleRangeChange}
              minLabel="Deductible"
              step={100}
              formatValue={(v) => `$${v}`}
            />
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Active Filters:
            </span>
            {filterState.searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-md">
                Search: "{filterState.searchQuery}"
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterState.coverageTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-md"
              >
                {COVERAGE_TYPE_LABELS[type]}
                <button
                  type="button"
                  onClick={() => onCoverageTypeToggle(type)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filterState.providers.map((provider) => (
              <span
                key={provider}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-md"
              >
                {PROVIDER_LABELS[provider]}
                <button
                  type="button"
                  onClick={() => onProviderToggle(provider)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {(filterState.premiumRange.min > 0 ||
              filterState.premiumRange.max < 1000) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-md">
                Premium: ${filterState.premiumRange.min} - $
                {filterState.premiumRange.max}
                <button
                  type="button"
                  onClick={() => onPremiumRangeChange({ min: 0, max: 1000 })}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filterState.deductibleRange.min > 0 ||
              filterState.deductibleRange.max < 10000) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-md">
                Deductible: ${filterState.deductibleRange.min} - $
                {filterState.deductibleRange.max}
                <button
                  type="button"
                  onClick={() =>
                    onDeductibleRangeChange({ min: 0, max: 10000 })
                  }
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
