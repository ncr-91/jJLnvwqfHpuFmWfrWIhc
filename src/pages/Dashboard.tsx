import { useMemo } from "react";
import { cardConfigs, cardSizeClasses } from "../config/cardConfigs";

import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import TableCard from "../components/TableCard";
import CreativesCard from "../components/CreativesCard";
import WidgetCard from "../components/WidgetCard";
import WidgetMapCard from "../components/WidgetMapCard";
import MapCard from "../components/MapCard";
import BrandHeader from "../components/BrandHeader";
import HeatMapCard from "../components/HeatMapCard";

const cardOrder = [
  "stat01",
  "widget02", //Media Share
  "widget04", //Region Activity
  "widget01", //Investment Media Weekly
  "widget03", //Daily Trend Weekly
  "creativesCard",
  "dashboard03", //12M Rolling Trend
  "dashboard06", //Category Share
  "dashboard05", //Media Type Share + Media Type Investment
  "heatmap01", //Heatmap
  "dashboard04", //Top Outlets Share
  "table01", //Top Outlets Share

  // "stat02",
  // "stat03",
  // "dashboard02",
  // "mapCard", //Region Breakdown
  //"dashboard01", //Media Type Investment
];

const Dashboard = () => {
  // Memoize the config map to prevent recreating it on every render
  const configMap = useMemo(
    () => Object.fromEntries(cardConfigs.map((cfg) => [cfg.id, cfg])),
    []
  );

  // Memoize the card components to prevent unnecessary re-renders
  const cardComponents = useMemo(
    () =>
      cardOrder
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
    <div className="dashboard">
      <div className="dashboard wrapper">
        <main className="grow">
          <section className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <BrandHeader />
            <div className="grid grid-cols-12 gap-6 auto-rows-[105px]">
              {cardComponents.map(({ key, className, component }) => (
                <div key={key} className={className}>
                  {component}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
