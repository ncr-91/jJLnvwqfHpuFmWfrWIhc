import React from "react";
import LoadingBlock from "./LoadingBlock";

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
      <div className="flex items-start mb-1">
        {loading ? (
          <LoadingBlock size="custom" height="h-8" width="w-32" />
        ) : (
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-md font-semibold text-oxford-blue-600 leading-tight">
                {title}
              </h2>
              <div className="text-xs text-frost-gray-500 font-medium mt-0.5 h-3">
                {subtitle && !loading ? subtitle : "\u00A0"}
              </div>
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
