import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Filter',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected option's label
  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full h-12 px-4 py-2 text-sm font-medium rounded-lg border ${
          isOpen 
            ? 'bg-slate-800 border-cyan-500 text-white' 
            : 'bg-transparent border-slate-700 text-stellar-card hover:border-slate-600 hover:bg-slate-800/50'
        } transition-colors`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          aria-hidden="true" 
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-slate-800 border border-slate-700 shadow-lg">
          <ul 
            role="listbox" 
            className="py-1 max-h-60 overflow-auto focus:outline-none text-sm"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={selectedValue === option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                  selectedValue === option.value 
                    ? 'bg-slate-700 text-cyan-400' 
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span>{option.label}</span>
                {selectedValue === option.value && (
                  <Check className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;