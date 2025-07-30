import { memo, useMemo, useState } from "react";
import { useOptimizedCardData } from "../hooks/useOptimizedCardData";
import { calculateTrendPercentage } from "../utils/utils";
import CardHeader from "./CardElements/CardHeader";
import TotalValue from "./CardElements/TotalSpendStat";
import TrendPill from "./CardElements/TrendPill";
import ChartContainer from "../charts/ChartContainer";
import ChartTimeSeriesMenu from "./CardElements/ChartTimeSeriesMenu";
import ChartTypeToggle from "./CardElements/ChartTypeToggle";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses, chartConfigs } from "../config/cardConfigs";

interface ChartCardProps {
  config: CardConfig;
}

const ChartCard = ({ config }: ChartCardProps) => {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");
  const [lineChartView, setLineChartView] = useState<"volume" | "percentage">(
    "volume"
  );

  // Use dashboard01 config when in bar chart mode for dashboard05
  const effectiveConfig = useMemo(() => {
    if (config.id === "dashboard05" && chartView === "bar") {
      const dashboard01Config = chartConfigs.find(
        (c) => c.id === "dashboard01"
      );
      if (dashboard01Config) {
        return {
          ...dashboard01Config,
          id: config.id,
          showCardActionButton: config.showCardActionButton,
          showCardHeader: config.showCardHeader,
          showCardHeaderBorder: config.showCardHeaderBorder,
          showDropdownMenu: config.showDropdownMenu,
          showTotal: config.showTotal,
          showTrend: config.showTrend,
        };
      }
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
      lineChartView={lineChartView}
      setLineChartView={setLineChartView}
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
  lineChartView: "volume" | "percentage";
  setLineChartView: (v: "volume" | "percentage") => void;
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
    lineChartView,
    setLineChartView,
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
            <div className="absolute top-5 right-5 flex flex-row items-center gap-3">
              {/* Only show ChartTypeToggle if there are multiple datasets with data */}
              {data?.chartData?.datasets &&
                data.chartData.datasets.length > 1 &&
                data.chartData.datasets.some(
                  (dataset: any) =>
                    dataset.data &&
                    Array.isArray(dataset.data) &&
                    dataset.data.some(
                      (value: any) => typeof value === "number" && value > 0
                    )
                ) && (
                  <ChartTypeToggle
                    currentView={lineChartView}
                    onToggle={() =>
                      setLineChartView(
                        lineChartView === "volume" ? "percentage" : "volume"
                      )
                    }
                    loading={loading}
                    options={[
                      { value: "volume", label: "Volume", icon: "show_chart" },
                      {
                        value: "percentage",
                        label: "Share",
                        icon: "pie_chart",
                      },
                    ]}
                  />
                )}
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
                  { value: "pie", label: "Share", icon: "pie_chart" },
                  { value: "bar", label: "Volume", icon: "bar_chart" },
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
              config.id === "dashboard05"
                ? chartView
                : (chartType as "pie" | "bar" | "line")
            }
            direction={
              config.id === "dashboard05" && chartView === "bar"
                ? "vertical"
                : config.BarChartDirection
            }
            percent={
              config.id === "dashboard05" && chartView === "bar"
                ? false
                : config.id === "dashboard03"
                ? lineChartView === "percentage"
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
