import { useMemo } from "react";
import { cardConfigs, cardSizeClasses } from "../config/cardConfigs";

import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import TableCard from "../components/TableCard";
import CreativesCard from "../components/CreativesCard";
import WidgetCard from "../components/WidgetCard";
import WidgetMapCard from "../components/WidgetMapCard";
import MapCard from "../components/MapCard";
import HeatMapCard from "../components/HeatMapCard";

// Different card order for Competitive page
const competitiveCardOrder = [
  "stat01",
  "widget02", // Media Share
  "dashboard03", // 12M Rolling Trend
  "dashboard06", // Category Share
  "heatmap01", // Heatmap
  "table01", // Top Outlets Share
  // Add more competitive-specific cards here
];

const Competitive = () => {
  // Memoize the config map to prevent recreating it on every render
  const configMap = useMemo(
    () => Object.fromEntries(cardConfigs.map((cfg) => [cfg.id, cfg])),
    []
  );

  // Memoize the card components to prevent unnecessary re-renders
  const cardComponents = useMemo(
    () =>
      competitiveCardOrder
        .map((cardId) => {
          const config = configMap[cardId];
          if (!config) return null;

          const sizeClass = cardSizeClasses[config.size || "md"];
          const rowSpanClass = config.rowSpan
            ? `row-span-${config.rowSpan}`
            : "";

          let component;
          switch (config.type) {
            case "stat":
              component = <StatCard config={config} />;
              break;
            case "chart":
              component = <ChartCard config={config} />;
              break;
            case "table":
              component = <TableCard config={config} />;
              break;
            case "creative":
              component = (
                <CreativesCard
                  config={config}
                  images={config.thumbnailUrls || []}
                  mediaUrls={config.mediaUrls || []}
                />
              );
              break;
            case "widget":
              component = <WidgetCard config={config} />;
              break;
            case "widgetMap":
              component = <WidgetMapCard config={config} />;
              break;
            case "map":
              component = <MapCard config={config} />;
              break;
            case "heatmap":
              component = <HeatMapCard config={config} />;
              break;
            default:
              component = null;
          }

          return {
            key: cardId,
            className: `${sizeClass} ${rowSpanClass}`.trim(),
            component,
          };
        })
        .filter(
          (
            item
          ): item is {
            key: string;
            className: string;
            component: React.ReactElement | null;
          } => item !== null
        ),
    [configMap]
  );

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-2 pb-8 w-full max-w-9xl mx-auto">
      <div className="grid grid-cols-12 gap-6 auto-rows-[105px]">
        {cardComponents.map(({ key, className, component }) => (
          <div key={key} className={className}>
            {component}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Competitive;
