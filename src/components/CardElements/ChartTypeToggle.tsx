import React from "react";
import LoadingBlock from "./LoadingBlock";

export interface ChartToggleOption {
  value: string;
  label: string;
  icon: string;
}

export interface ChartTypeToggleProps {
  /** Current active view value */
  currentView: string;
  /** Callback function when toggle is clicked */
  onToggle: () => void;
  /** Whether the button should show loading state */
  loading?: boolean;
  /** Array of available options to cycle through */
  options: ChartToggleOption[];
  /** Optional custom CSS classes */
  className?: string;
}

const ChartTypeToggle: React.FC<ChartTypeToggleProps> = ({
  currentView,
  onToggle,
  loading = false,
  options,
  className = "",
}) => {
  const currentIndex = options.findIndex(
    (option) => option.value === currentView
  );
  const nextIndex = (currentIndex + 1) % options.length;
  const nextOption = options[nextIndex];

  return (
    <div className="relative">
      {loading ? (
        <LoadingBlock size="custom" height="h-8" width="w-28" />
      ) : (
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-colors bg-white border-frost-gray-200 text-frost-gray-900 hover:bg-teal-50 hover:text-teal-800 focus:outline-none ${className}`}
        >
          <span className="material-symbols-outlined text-sm">
            {nextOption?.icon}
          </span>
          <span className="text-xs font-medium">{nextOption?.label}</span>
        </button>
      )}
    </div>
  );
};

export default ChartTypeToggle;
