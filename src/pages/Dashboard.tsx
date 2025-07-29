import React from "react";
import { cardConfigs, cardSizeClasses } from "../config/cardConfigs";
import type { CardConfig } from "../config/cardConfigs";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import TableCard from "../components/TableCard";
import CreativesCard from "../components/CreativesCard";
import WidgetCard from "../components/WidgetCard";
import WidgetMapCard from "../components/WidgetMapCard";
import MapCard from "../components/MapCard";
import BrandHeader from "../components/BrandHeader";

const cardOrder = [
  "stat01",
  "widget02", //Media Share
  "widget04", //Region Activity
  "widget01", //Investment Media Weekly
  "widget03", //Daily Trend Weekly
  "dashboard03", //12M Rolling Trend

  "dashboard05", //Media Type Share
  "dashboard04", //Top Outlets Share

  // "stat02",
  // "stat03",
  // "dashboard02",
  // "mapCard", //Region Breakdown
  //"dashboard01", //Media Type Investment

  "creativesCard",
  "table01",
];

const configMap = Object.fromEntries(cardConfigs.map((cfg) => [cfg.id, cfg]));

function getCardComponent(config: CardConfig) {
  switch (config.type) {
    case "stat":
      return <StatCard config={config} />;
    case "chart":
      return <ChartCard config={config} />;
    case "table":
      return <TableCard config={config} />;
    case "creative":
      return <CreativesCard config={config} />;
    case "widget":
      return <WidgetCard config={config} />;
    case "widgetMap":
      return <WidgetMapCard config={config} />;
    case "map":
      return <MapCard config={config} />;
    default:
      return null;
  }
}

const Dashboard = () => (
  <div className="dashboard">
    <div className="dashboard wrapper">
      <main className="grow">
        <section className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          <BrandHeader />
          <div className="grid grid-cols-12 gap-6 auto-rows-[239px]">
            {cardOrder.map((cardId) => {
              const config = configMap[cardId];
              if (!config) return null;
              const sizeClass = cardSizeClasses[config.size || "md"];
              const rowSpanClass = config.rowSpan
                ? `row-span-${config.rowSpan}`
                : "";
              return (
                <div
                  key={cardId}
                  className={`${sizeClass} ${rowSpanClass}`.trim()}
                >
                  {getCardComponent(config)}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  </div>
);

export default Dashboard;
