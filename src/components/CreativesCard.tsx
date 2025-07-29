import React, { memo } from "react";
import CardHeader from "./CardElements/CardHeader";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";

const NUM_CARDS = 12;

interface CreativesCardProps {
  config: CardConfig;
}

const CreativesCard = ({ config }: CreativesCardProps) => {
  if (config.type !== "creative") {
    return (
      <div className="text-red-500">Invalid card type for creatives card</div>
    );
  }
  return <SingleCreativesCard config={config} />;
};

interface SingleCreativesCardProps {
  config: CardConfig;
}

const SingleCreativesCard = memo(({ config }: SingleCreativesCardProps) => {
  const sizeClass = cardSizeClasses[config.size || "sm"];
  const rowSpanClass = config.rowSpan ? `row-span-${config.rowSpan}` : "";

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
    >
      <div className="relative">
        <CardHeader loading={false} title="Latest Creatives" />
        {config.showCardActionButton && (
          <div className="absolute top-1/2 right-5 -translate-y-1/2">
            <a
              href="https://creativeportal.candami.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800 bg-teal-100 hover:bg-teal-200 text-sm font-semibold px-2 py-1 rounded-lg focus:outline-none inline-flex items-center"
            >
              View More
              <span className="material-symbols-outlined text-2xl ml-1 pb-[2px] select-none">
                arrow_forward
              </span>
            </a>
          </div>
        )}
      </div>
      <div className="border-b border-frost-gray-100 w-full" />
      <div className="flex flex-col">
        <div
          className="grid gap-4 mt-6 mb-6 px-6 min-w-0 w-full overflow-y-auto pb-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            maxHeight: "400px",
          }}
        >
          {Array.from({ length: NUM_CARDS }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center h-[180px] bg-frost-gray-50 rounded-2xl border border-gray-200 text-oxford-blue-400 text-center text-base min-w-0"
              style={{ wordBreak: "break-word" }}
            >
              Creative Shown Here
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

SingleCreativesCard.displayName = "SingleCreativesCard";

export default CreativesCard;
