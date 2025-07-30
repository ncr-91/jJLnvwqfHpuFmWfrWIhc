import React from "react";

interface LoadingBlockProps {
  /** Size variant for the loading block */
  size?: "sm" | "md" | "lg" | "custom";
  /** Custom width (only used when size is "custom") */
  width?: string;
  /** Custom height (only used when size is "custom") */
  height?: string;
  /** Additional CSS classes */
  className?: string;
}

const LoadingBlock: React.FC<LoadingBlockProps> = ({
  size = "md",
  width,
  height,
  className = "",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-6 w-20";
      case "md":
        return "h-8 w-28";
      case "lg":
        return "h-10 w-32";
      case "custom":
        return `${height || "h-8"} ${width || "w-28"}`;
      default:
        return "h-8 w-28";
    }
  };

  return (
    <span
      className={`inline-block bg-frost-gray-200 rounded animate-pulse ${getSizeClasses()} ${className}`}
    />
  );
};

export default LoadingBlock;
