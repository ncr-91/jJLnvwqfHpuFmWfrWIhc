import { memo, useMemo, useState, useCallback } from "react";
import LoadingBlock from "./CardElements/LoadingBlock";
import { useOptimizedCardData } from "../hooks/useOptimizedCardData";
import { calculateTrendPercentage } from "../utils/utils";
import { formatCurrency } from "../utils/utils";
import HeaderTitle from "./CardElements/CardHeader";
import TotalValue from "./CardElements/TotalSpendStat";
import TrendPill from "./CardElements/TrendPill";
import ChartContainer from "../charts/ChartContainer";
import CardActionButton from "./CardElements/CardActionButton";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";

interface StatCardProps {
  config: CardConfig;
}

const StatCard = ({ config }: StatCardProps) => {
  const { data, loading, error } = useOptimizedCardData(config);
  if (!("chartType" in config)) {
    return <div className="text-red-500">Invalid card type for stat card</div>;
  }
  return (
    <SingleStatCard
      data={data}
      loading={loading}
      error={error}
      config={config}
    />
  );
};

interface SingleStatCardProps {
  data: any;
  loading: boolean;
  error: string | null;
  config: CardConfig;
}

const SingleStatCard = memo(
  ({ data, loading, error, config }: SingleStatCardProps) => {
    const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
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
    const handleViewModeChange = useCallback(() => {
      setViewMode((prev: "chart" | "table") =>
        prev === "chart" ? "table" : "chart"
      );
    }, []);
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
        {config.showCardHeader && (
          <HeaderTitle
            loading={loading}
            title={data?.headerTitle || config.id}
            showCardHeaderBorder={config.showCardHeaderBorder}
          />
        )}
        {config.showDropdownMenu && (
          <div className="absolute top-4 right-4">
            <CardActionButton>
              {(close) => (
                <li>
                  <button
                    onClick={() => {
                      handleViewModeChange();
                      close();
                    }}
                    className="flex items-center gap-2 w-full text-sm font-semibold text-left px-4 py-2 text-frost-gray-700 hover:bg-gray-100 transition duration-15"
                  >
                    <span className="material-symbols-outlined">
                      {viewMode === "chart" ? "data_table" : "show_chart"}
                    </span>
                    <span>{viewMode === "chart" ? "Table" : "Chart"}</span>
                  </button>
                </li>
              )}
            </CardActionButton>
          </div>
        )}
        {(showTotal || showTrend) && (
          <div className="flex items-center px-7">
            {showTotal && (
              <TotalValue
                loading={loading}
                total={loading ? undefined : data?.total}
              />
            )}
            {showTrend && (
              <div className={`flex items-center ${loading ? "-mt-2" : ""}`}>
                <TrendPill
                  loading={loading}
                  isDecrement={loading ? false : isDecrement}
                  percentage={loading ? 0 : percentage}
                  showYoY={true}
                />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-h-0 -mt-5 -mb-3 flex flex-col">
          {viewMode === "chart" ? (
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
          ) : (
            <div className="overflow-x-auto mt-1 ml-2.5 mr-2.5">
              {/* Add extra margin-top for spacing below total spend stat */}
              <div className="mt-4">
                {loading ? (
                  // Skeleton table
                  <>
                    <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 font-semibold border-b border-gray-200">
                            Month
                          </th>
                          <th className="px-2 py-1 font-semibold border-b border-gray-200">
                            {data?.chartData?.datasets?.[1]?.label || "2024"}
                          </th>
                          <th className="px-2 py-1 font-semibold border-b border-gray-200">
                            {data?.chartData?.datasets?.[0]?.label || "2025"}
                          </th>
                        </tr>
                      </thead>
                    </table>
                    <div className="overflow-y-auto max-h-[90px]">
                      <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
                        <tbody>
                          {[...Array(3)].map((_, i) => (
                            <tr key={i}>
                              <td className="px-2 py-1 border-b border-gray-100">
                                <LoadingBlock size="sm" width="w-16" />
                              </td>
                              <td className="px-2 py-1 border-b border-gray-100">
                                <LoadingBlock size="sm" width="w-12" />
                              </td>
                              <td className="px-2 py-1 border-b border-gray-100">
                                <LoadingBlock size="sm" width="w-12" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  // Real data table
                  <>
                    <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 font-semibold border-b border-gray-200">
                            Month
                          </th>
                          <th className="px-2 py-1 font-semibold border-b border-gray-200">
                            {data?.chartData?.datasets?.[1]?.label || "2024"}
                          </th>
                          <th className="px-2 py-1 font-semibold border-b border-gray-200">
                            {data?.chartData?.datasets?.[0]?.label || "2025"}
                          </th>
                        </tr>
                      </thead>
                    </table>
                    <div className="overflow-y-auto max-h-[90px]">
                      <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
                        <tbody>
                          {data?.chartData?.labels.map(
                            (label: string, index: number) => (
                              <tr key={label}>
                                <td className="px-2 py-1 border-b border-gray-100">
                                  {label}
                                </td>
                                <td className="px-2 py-1 border-b border-gray-100">
                                  {data.chartData.datasets[1].data[index] !=
                                  null
                                    ? formatCurrency(
                                        data.chartData.datasets[1].data[
                                          index
                                        ] as number
                                      )
                                    : "\u2014"}
                                </td>
                                <td className="px-2 py-1 border-b border-gray-100">
                                  {data.chartData.datasets[0].data[index] !=
                                  null
                                    ? formatCurrency(
                                        data.chartData.datasets[0].data[
                                          index
                                        ] as number
                                      )
                                    : "\u2014"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SingleStatCard.displayName = "SingleStatCard";

export default StatCard;
