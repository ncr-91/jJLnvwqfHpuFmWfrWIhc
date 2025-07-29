import React from "react";

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
    <>
      {loading ? (
        <span className="inline-block h-8 w-28 bg-frost-gray-200 rounded animate-pulse" />
      ) : (
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className={`flex items-center px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium text-sm focus:outline-none hover:bg-teal-50 hover:text-teal-700 transition-colors ${className}`}
        >
          <span className="material-symbols-outlined text-sm mr-1">
            {nextOption?.icon}
          </span>
          {nextOption?.label}
        </button>
      )}
    </>
  );
};

export default ChartTypeToggle;
