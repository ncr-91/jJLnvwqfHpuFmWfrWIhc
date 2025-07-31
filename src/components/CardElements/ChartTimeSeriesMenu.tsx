import { useState, useRef, useEffect } from "react";
import LoadingBlock from "./LoadingBlock";

interface ChartTimeSeriesMenuProps {
  value: "daily" | "weekly" | "monthly";
  onChange: (view: "daily" | "weekly" | "monthly") => void;
  loading?: boolean;
}

const TIME_VIEWS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

/**
 * A dropdown menu component for switching between time series views (daily, weekly, monthly).
 * Used specifically for time series charts like line charts.
 */
function ChartTimeSeriesMenu({
  value,
  onChange,
  loading = false,
}: ChartTimeSeriesMenuProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = TIME_VIEWS.find((v) => v.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {loading ? (
        <LoadingBlock size="custom" height="h-8" width="w-28" />
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!loading) setOpen((prev) => !prev);
          }}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-colors bg-white border-frost-gray-200 text-frost-gray-900 hover:bg-teal-50 hover:text-teal-800 focus:outline-none"
          disabled={loading}
        >
          <span className="text-xs font-medium">
            {selected?.label || "Select"}
          </span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      )}
      {open && !loading && (
        <div className="absolute left-0 mt-2 w-28 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {TIME_VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => {
                onChange(v.value as "daily" | "weekly" | "monthly");
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-medium text-frost-gray-900 transition-colors duration-75 ${
                value === v.value
                  ? "bg-teal-100 text-teal-800"
                  : "hover:bg-teal-50 hover:text-teal-800"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChartTimeSeriesMenu;
