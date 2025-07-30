import { memo, useState, useEffect, useCallback, useMemo } from "react";
import WidgetHeader from "./CardElements/WidgetHeader";
import LinkButton from "./CardElements/LinkButton";
import LoadingBlock from "./CardElements/LoadingBlock";
import ImageModal from "./CardElements/ImageModal";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";

const NUM_CARDS = 10;

interface CreativesCardProps {
  config: CardConfig;
  images?: string[];
  mediaUrls?: string[]; // Video URLs for each creative
  loading?: boolean;
}

const CreativesCard = ({
  config,
  images = [],
  mediaUrls = [],
  loading = false,
}: CreativesCardProps) => {
  if (config.type !== "creative") {
    return (
      <div className="text-red-500">Invalid card type for creatives card</div>
    );
  }
  return (
    <SingleCreativesCard
      config={config}
      images={images}
      mediaUrls={mediaUrls}
      loading={loading}
    />
  );
};

interface SingleCreativesCardProps {
  config: CardConfig;
  images?: string[];
  mediaUrls?: string[]; // Video URLs for each creative
  loading?: boolean;
}

const SingleCreativesCard = memo(
  ({
    config,
    images = [],
    mediaUrls = [],
    loading = false,
  }: SingleCreativesCardProps) => {
    const sizeClass = cardSizeClasses[config.size || "sm"];
    const rowSpanClass = config.rowSpan ? `row-span-${config.rowSpan}` : "";
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [modalMedia, setModalMedia] = useState<{
      url: string;
      alt: string;
      type: "image" | "video";
    } | null>(null);

    // Pre-compute static arrays to avoid recreating them on every render
    const cardIndices = useMemo(
      () => Array.from({ length: NUM_CARDS }, (_, i) => i),
      []
    );
    const carouselIndicators = useMemo(
      () => Array.from({ length: Math.ceil(NUM_CARDS / 6) }, (_, i) => i),
      []
    );

    // Simulate loading delay
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // 1.5 seconds delay

      return () => clearTimeout(timer);
    }, []);

    const nextSlide = useCallback(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, NUM_CARDS - 8));
    }, []);

    const prevSlide = useCallback(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    // Use the simulated loading state or the prop loading state
    const showLoading = loading || isLoading;

    const handleMediaClick = useCallback(
      (index: number) => {
        const imageUrl = images[index];
        const mediaUrl = mediaUrls[index];

        if (mediaUrl) {
          // Determine if the media URL is actually a video or image based on extension
          const isVideo =
            mediaUrl.includes(".mp4") ||
            mediaUrl.includes(".webm") ||
            mediaUrl.includes(".ogg") ||
            mediaUrl.includes(".mov");

          setModalMedia({
            url: mediaUrl,
            alt: `Creative ${index + 1} ${isVideo ? "Video" : "Image"}`,
            type: isVideo ? ("video" as const) : ("image" as const),
          });
        } else if (imageUrl) {
          // Fallback to thumbnail image if no media URL
          setModalMedia({
            url: imageUrl,
            alt: `Creative ${index + 1}`,
            type: "image" as const,
          });
        }
      },
      [images, mediaUrls]
    );

    const closeModal = useCallback(() => {
      setModalMedia(null);
    }, []);

    // Memoize the carousel transform style
    const carouselTransform = useMemo(
      () => ({
        transform: `translateX(-${currentIndex * (100 / 8)}%)`,
      }),
      [currentIndex]
    );

    // Memoize the carousel navigation disabled states
    const navigationDisabled = useMemo(
      () => ({
        prev: currentIndex === 0 || showLoading,
        next: currentIndex >= NUM_CARDS - 8 || showLoading,
      }),
      [currentIndex, showLoading]
    );

    return (
      <div
        className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
      >
        {config.showCardHeader && (
          <div className="relative">
            <WidgetHeader
              loading={showLoading}
              title="Latest Creatives"
              showWidgetHeaderBorder={config.showCardHeaderBorder}
            />
            <div className="absolute top-4 right-5 z-10">
              <LinkButton
                href="https://creativeportal.candami.com/"
                icon="arrow_forward"
                title="Canda MI"
                text="View More"
                loading={showLoading}
              />
            </div>
          </div>
        )}
        <div className="flex-1 p-4">
          {/* Desktop Grid Layout */}
          <div className="hidden 2xl:grid 2xl:grid-cols-10 gap-2 h-full">
            {cardIndices.map((index) => {
              const imageUrl = images[index];
              const displayUrl = imageUrl;
              return (
                <div
                  key={index}
                  className="relative bg-frost-gray-50 rounded-lg border border-gray-200 text-oxford-blue-400 text-center text-xs hover:bg-frost-gray-100 transition-colors cursor-pointer overflow-hidden"
                  title={`Creative ${index + 1}`}
                  onClick={() => handleMediaClick(index)}
                >
                  {showLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <LoadingBlock
                        size="custom"
                        height="h-full"
                        width="w-full"
                        className="rounded-lg"
                      />
                    </div>
                  ) : displayUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <img
                        src={displayUrl}
                        alt={`Creative ${index + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    </div>
                  ) : null}
                  {!showLoading && !displayUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-frost-gray-400">
                        Creative {index + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Carousel Layout */}
          <div className="2xl:hidden relative h-full overflow-hidden mx-7">
            <div
              className="flex transition-transform duration-300 ease-in-out h-full"
              style={carouselTransform}
            >
              {cardIndices.map((index) => {
                const imageUrl = images[index];
                const displayUrl = imageUrl;
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 w-1/3 px-1 md:w-[20%] lg:w-[12.5%]"
                  >
                    <div
                      className="relative bg-frost-gray-50 rounded-lg border border-gray-200 text-oxford-blue-400 text-center text-xs overflow-hidden h-full cursor-pointer hover:bg-frost-gray-100 transition-colors"
                      onClick={() => handleMediaClick(index)}
                    >
                      {showLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <LoadingBlock
                            size="custom"
                            height="h-full"
                            width="w-full"
                            className="rounded-lg"
                          />
                        </div>
                      ) : displayUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <img
                            src={displayUrl}
                            alt={`Creative ${index + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        </div>
                      ) : null}
                      {!showLoading && !displayUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-frost-gray-400">
                            Creative {index + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 hidden">
              {carouselIndicators.map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * 6)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / 6) === index
                      ? "bg-teal-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  title={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Carousel Navigation - Outside container */}
          <div className="2xl:hidden absolute inset-x-0 top-[60%] -translate-y-1/2 flex justify-between pointer-events-none px-2">
            <button
              onClick={prevSlide}
              disabled={navigationDisabled.prev}
              className="w-8 h-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-teal-700 transition-colors disabled:bg-gray-100 disabled:border-gray-100 disabled:text-gray-300 pointer-events-auto"
              title="Previous"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <button
              onClick={nextSlide}
              disabled={navigationDisabled.next}
              className="w-8 h-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-teal-700 transition-colors disabled:bg-gray-100 disabled:border-gray-100 disabled:text-gray-300 pointer-events-auto"
              title="Next"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Media Modal */}
        {modalMedia && (
          <ImageModal
            isOpen={!!modalMedia}
            onClose={closeModal}
            mediaUrl={modalMedia.url}
            mediaAlt={modalMedia.alt}
            mediaType={modalMedia.type}
            linkHref="https://creativeportal.candami.com/"
            linkText="View Details"
          />
        )}
      </div>
    );
  }
);

SingleCreativesCard.displayName = "SingleCreativesCard";

export default CreativesCard;
