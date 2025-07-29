import React from "react";

interface WidgetHeaderProps {
  loading: boolean;
  title?: string | null;
  subtitle?: string | null;
  showWidgetHeaderBorder?: boolean;
}

const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  loading,
  title,
  subtitle,
  showWidgetHeaderBorder = true,
}) => (
  <>
    <div className="px-5 pt-4">
      <div className="flex items-center mb-1 min-h-[2.5rem]">
        {loading ? (
          <span className="inline-block h-8 w-32 bg-frost-gray-200 rounded animate-pulse" />
        ) : (
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-md font-semibold text-oxford-blue-600 leading-tight">
                {title}
              </h2>
              {subtitle && !loading && (
                <div className="text-xs text-frost-gray-500 font-medium mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    {showWidgetHeaderBorder && (
      <div className="border-b border-frost-gray-100 w-full" />
    )}
  </>
);

export default WidgetHeader;
