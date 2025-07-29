import React, { useState, useRef, useEffect } from "react";
import type { ReactNode, RefObject } from "react";

interface CardActionButtonProps {
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  className?: string;
}

/**
 * A general-purpose action button component that displays a dropdown menu.
 * Used for card-level actions and menu options.
 */
function CardActionButton({
  children,
  align = "right",
  className = "",
}: CardActionButtonProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-center cursor-pointer w-8 h-8 rounded-full
          ${open ? "bg-gray-100 text-gray-500" : "text-gray-400"}
          hover:bg-gray-100 lg:hover:bg-gray-200`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menu"
      >
        <span className="material-icons text-2xl select-none">more_vert</span>
      </button>

      {open && (
        <div
          className={`absolute ${
            align === "left" ? "left-0" : "right-0"
          } w-32 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}
        >
          <ul>
            {typeof children === "function"
              ? (children as (close: () => void) => ReactNode)(() =>
                  setOpen(false)
                )
              : children}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CardActionButton;
