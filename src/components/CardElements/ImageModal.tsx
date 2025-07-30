import React, { useEffect, useCallback } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaAlt: string;
  mediaType?: "image" | "video" | "auto";
  linkHref?: string;
  linkText?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaAlt,
  mediaType = "auto",
  linkHref,
  linkText,
}) => {
  // Close modal on escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  // Memoize the media type detection
  const shouldShowVideo = React.useMemo(() => {
    if (mediaType === "video") {
      return true;
    } else if (mediaType === "image") {
      return false;
    } else {
      // Auto detection based on URL
      return (
        mediaUrl.includes(".mp4") ||
        mediaUrl.includes(".webm") ||
        mediaUrl.includes(".ogg") ||
        mediaUrl.includes(".mov") ||
        mediaUrl.includes("blob.core.windows.net") ||
        mediaUrl.includes("hzhstorage.blob.core.windows.net")
      );
    }
  }, [mediaUrl, mediaType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Image Card with Close Button */}
      <div className="relative">
        {/* Close Button - Positioned with gap from the card */}
        <button
          onClick={onClose}
          className="absolute -top-14 -right-11 z-20 inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors bg-white border-frost-gray-200 text-frost-gray-900 hover:bg-teal-50 hover:text-teal-800 shadow-lg"
          title="Close"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {/* Link Button - Positioned next to close button */}
        {linkHref && linkText && (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-14 right-0 z-20 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-colors bg-white border-frost-gray-200 text-frost-gray-900 hover:bg-teal-50 hover:text-teal-800 shadow-lg"
            title={linkText}
          >
            <span className="text-xs font-medium">{linkText}</span>
            <span className="material-symbols-outlined text-sm">
              arrow_outward
            </span>
          </a>
        )}

        {/* Media Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-[90vw] max-h-[90vh]">
          {/* Media Content */}
          <div className="relative">
            {shouldShowVideo ? (
              <video
                src={mediaUrl}
                controls
                preload="metadata"
                className="max-w-full max-h-[90vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  target.style.display = "none";
                  // Show fallback text
                  const fallback = document.createElement("div");
                  fallback.className =
                    "flex items-center justify-center h-64 text-gray-500";
                  fallback.textContent = "Video failed to load";
                  target.parentNode?.appendChild(fallback);
                }}
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={mediaUrl}
                alt={mediaAlt}
                className="max-w-full max-h-[90vh] object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  // Show fallback text
                  const fallback = document.createElement("div");
                  fallback.className =
                    "flex items-center justify-center h-64 text-gray-500";
                  fallback.textContent = "Image failed to load";
                  target.parentNode?.appendChild(fallback);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
