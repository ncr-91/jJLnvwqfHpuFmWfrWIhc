import { memo, useMemo } from "react";
import { useOptimizedCardData } from "../hooks/useOptimizedCardData";
import { calculateTrendPercentage } from "../utils/utils";
import WidgetHeader from "./CardElements/WidgetHeader";
import TotalValue from "./CardElements/TotalSpendStat";
import TrendPill from "./CardElements/TrendPill";
import ChartContainer from "../charts/ChartContainer";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";

interface WidgetCardProps {
  config: CardConfig;
}

const WidgetCard = ({ config }: WidgetCardProps) => {
  const { data, loading, error } = useOptimizedCardData(config);
  if (!("chartType" in config)) {
    return (
      <div className="text-red-500">Invalid card type for widget card</div>
    );
  }
  return (
    <SingleWidgetCard
      data={data}
      loading={loading}
      error={error}
      config={config}
    />
  );
};

interface SingleWidgetCardProps {
  data: any;
  loading: boolean;
  error: string | null;
  config: CardConfig;
}

const SingleWidgetCard = memo(
  ({ data, loading, error, config }: SingleWidgetCardProps) => {
    const { chartType, showTrend, showTotal, size, rowSpan } = config;
    const sizeClass = cardSizeClasses[size || "sm"];
    const rowSpanClass = rowSpan ? `row-span-${rowSpan}` : "";
    const { trend, percentage } = useMemo(() => {
      if (!showTrend || !data?.currentMonthCount || !data?.lastMonthCount) {
        return { trend: "increment" as const, percentage: 0 };
      }
      return calculateTrendPercentage(
        data.currentMonthCount,
        data.lastMonthCount
      );
    }, [data?.currentMonthCount, data?.lastMonthCount, showTrend]);
    if (error) return <div className="text-red-500">Error: {error}</div>;
    const isDataEmpty =
      !data ||
      (typeof data === "object" &&
        !data.chartData &&
        !data.total &&
        !data.headerTitle &&
        Object.keys(data).length === 0);
    if (!loading && !error && isDataEmpty) return <div>No data available</div>;
    const isDecrement = trend === "decrement";
    return (
      <div
        className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
      >
        {/* TrendPill in top right corner for WidgetCard */}
        {showTrend && (
          <div className="absolute top-4 right-4 z-10">
            <TrendPill
              loading={loading}
              isDecrement={loading ? false : isDecrement}
              percentage={loading ? 0 : percentage}
            />
          </div>
        )}
        {config.showCardHeader && (
          <WidgetHeader
            loading={loading}
            title={data?.headerTitle || config.id}
            subtitle={config.showWidgetSubtitle ? data?.subtitle : undefined}
            showWidgetHeaderBorder={config.showCardHeaderBorder}
          />
        )}
        {showTotal && (
          <div className="flex items-start px-7">
            <TotalValue
              loading={loading}
              total={loading ? undefined : data?.total}
            />
          </div>
        )}
        <div className="flex-1 min-h-0 -mb-2 pb-3 flex flex-col">
          <ChartContainer
            loading={loading}
            chartData={loading ? undefined : data?.chartData}
            type={chartType as string}
            direction={config.BarChartDirection}
            percent={config.BarChartPercent}
            stacked={config.BarChartStacked}
            showChartLegend={config.showChartLegend}
            legendPosition={config.legendPosition}
            showChartGridlineX={config.showChartGridlineX}
            showChartGridlineY={config.showChartGridlineY}
            showLineChartGradient={config.showLineChartGradient}
            xAxisType={config.xAxisType}
            view={config.view}
            tooltipMode="label"
            showChartLabelsX={config.showChartLabelsX}
            showChartLabelsY={config.showChartLabelsY}
            pieChartCutout={config.pieChartCutout}
          />
        </div>
      </div>
    );
  }
);

SingleWidgetCard.displayName = "SingleWidgetCard";

export default WidgetCard;
