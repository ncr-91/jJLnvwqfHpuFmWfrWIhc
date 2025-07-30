import { memo } from "react";
import LoadingBlock from "./LoadingBlock";

interface LinkButtonProps {
  href: string;
  icon: string;
  title: string;
  text: string;
  className?: string;
  loading?: boolean;
}

const LinkButton = memo(
  ({
    href,
    icon,
    title,
    text,
    className = "",
    loading = false,
  }: LinkButtonProps) => {
    if (loading) {
      return (
        <div
          className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-colors bg-white border-frost-gray-200 text-frost-gray-900 hover:bg-teal-50 hover:text-teal-800 ${className}`}
        >
          <LoadingBlock size="custom" height="h-7" width="w-24" />
        </div>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-colors bg-white border-frost-gray-200 text-frost-gray-900 hover:bg-teal-50 hover:text-teal-800 ${className}`}
        title={title}
      >
        <span className="text-xs font-medium">{text}</span>
        <span className="material-symbols-outlined text-sm">{icon}</span>
      </a>
    );
  }
);

LinkButton.displayName = "LinkButton";

export default LinkButton;
