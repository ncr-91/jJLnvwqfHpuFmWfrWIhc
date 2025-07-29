import React, { memo, useMemo, useState } from "react";
import { useOptimizedCardData } from "../hooks/useOptimizedCardData";
import { calculateTrendPercentage } from "../utils/utils";
import CardHeader from "./CardElements/CardHeader";
import TotalValue from "./CardElements/TotalSpendStat";
import TrendPill from "./CardElements/TrendPill";
import ChartContainer from "../charts/ChartContainer";
import ChartTimeSeriesMenu from "./CardElements/ChartTimeSeriesMenu";
import ChartTypeToggle from "./CardElements/ChartTypeToggle";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";

interface ChartCardProps {
  config: CardConfig;
}

const ChartCard = ({ config }: ChartCardProps) => {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");

  // Use dashboard01 config when in bar chart mode for dashboard05
  const effectiveConfig = useMemo(() => {
    if (config.id === "dashboard05" && chartView === "bar") {
      // Find dashboard01 config
      const dashboard01Config: CardConfig = {
        ...config,
        csvUrl:
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLjue9MJvewUb1ZK7TZ4XgVjM0vRsfb07tPzDTbkGWNzfWAtLfY-NsRHZv5W-HM9W87vorat1fGnz8/pub?gid=1166537229&single=true&output=csv",
        chartType: "bar",
        BarChartStacked: true,
        BarChartDirection: "vertical",
        BarChartPercent: false,
        parserType: "barChart",
      };
      return dashboard01Config;
    }
    return config;
  }, [config, chartView]);

  const { data, loading, error } = useOptimizedCardData(
    effectiveConfig,
    config.id === "dashboard03" ? view : undefined
  );

  if (!("chartType" in config)) {
    return <div className="text-red-500">Invalid card type for chart card</div>;
  }

  return (
    <SingleChartCard
      data={data}
      loading={loading}
      error={error}
      config={effectiveConfig}
      view={view}
      setView={setView}
      chartView={chartView}
      setChartView={setChartView}
    />
  );
};

interface SingleChartCardProps {
  data: any;
  loading: boolean;
  error: string | null;
  config: CardConfig;
  view: "daily" | "weekly" | "monthly";
  setView: (v: "daily" | "weekly" | "monthly") => void;
  chartView: "pie" | "bar";
  setChartView: (v: "pie" | "bar") => void;
}

const SingleChartCard = memo(
  ({
    data,
    loading,
    error,
    config,
    view,
    setView,
    chartView,
    setChartView,
  }: SingleChartCardProps) => {
    const {
      chartType,
      showTrend,
      showTotal,
      showCardActionButton,
      id,
      size,
      rowSpan,
    } = config;
    const sizeClass = cardSizeClasses[size || "md"];
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
      !data || (typeof data === "object" && Object.keys(data).length === 0);
    if (!loading && !error && isDataEmpty) return <div>No data available</div>;
    const isDecrement = trend === "decrement";
    return (
      <div
        className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
      >
        <div className="relative">
          <CardHeader
            loading={loading}
            title={loading ? undefined : data?.headerTitle}
          />
          {id === "dashboard03" && (
            <div className="absolute top-5 right-5">
              <ChartTimeSeriesMenu
                loading={loading}
                value={view}
                onChange={setView}
              />
            </div>
          )}
          {id === "dashboard05" && showCardActionButton && (
            <div className="absolute top-5 right-5">
              <ChartTypeToggle
                currentView={chartView}
                onToggle={() =>
                  setChartView(chartView === "pie" ? "bar" : "pie")
                }
                loading={loading}
                options={[
                  { value: "pie", label: "Pie", icon: "pie_chart" },
                  { value: "bar", label: "Bar", icon: "bar_chart" },
                ]}
              />
            </div>
          )}
        </div>
        <div className="border-b border-frost-gray-100 w-full" />
        <div className="mt-1 px-5">
          {(showTotal || showTrend) && (
            <div className="flex items-start">
              {showTotal && (
                <TotalValue
                  loading={loading}
                  total={loading ? undefined : data?.total}
                />
              )}
              {showTrend && (
                <TrendPill
                  loading={loading}
                  isDecrement={loading ? false : isDecrement}
                  percentage={loading ? 0 : percentage}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <ChartContainer
            id={config.id}
            loading={loading}
            chartData={loading ? undefined : data?.chartData}
            type={
              config.id === "dashboard05" ? chartView : (chartType as string)
            }
            direction={
              config.id === "dashboard05" && chartView === "bar"
                ? "vertical"
                : config.BarChartDirection
            }
            percent={
              config.id === "dashboard05" && chartView === "bar"
                ? false
                : config.BarChartPercent
            }
            stacked={
              config.id === "dashboard05" && chartView === "bar"
                ? true
                : config.BarChartStacked
            }
            showChartLegend={config.showChartLegend}
            legendPosition={config.legendPosition}
            showChartGridlineX={config.showChartGridlineX}
            showChartGridlineY={config.showChartGridlineY}
            showLineChartGradient={config.showLineChartGradient}
            xAxisType={config.xAxisType}
            // For dashboard03, pass the view from state, otherwise from config
            view={config.id === "dashboard03" ? view : config.view}
            showChartLabelsX={config.showChartLabelsX}
            showChartLabelsY={config.showChartLabelsY}
            pieChartCutout={config.pieChartCutout}
            pieChartType={config.pieChartType}
          />
        </div>
      </div>
    );
  }
);

SingleChartCard.displayName = "SingleChartCard";

export default ChartCard;
