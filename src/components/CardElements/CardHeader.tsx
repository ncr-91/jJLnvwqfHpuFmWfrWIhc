import React from "react";
import LoadingBlock from "./LoadingBlock";

interface CardHeaderProps {
  loading: boolean;
  title?: string | null;
  showCardHeaderBorder?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  loading,
  title,
  showCardHeaderBorder = true,
}) => (
  <>
    <div className="px-6 pt-6">
      <div className="flex items-center mb-4 min-h-[2.5rem]">
        {loading ? (
          <LoadingBlock size="custom" height="h-8" width="w-40" />
        ) : (
          <h2 className="flex items-center gap-2 text-lg font-semibold text-oxford-blue-900">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-800 text-md font-bold">
              {title?.charAt(0).toUpperCase()}
            </span>{" "}
            {title}
          </h2>
        )}
      </div>
    </div>
    {showCardHeaderBorder && (
      <div className="border-b border-frost-gray-100 w-full" />
    )}
  </>
);

export default CardHeader;
