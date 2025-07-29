import React, { memo, useMemo } from "react";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
type ChartType = string;

interface ChartContainerProps {
  id?: string;
  loading: boolean;
  chartData: any;
  type: ChartType;
  width?: number;
  height?: number;
  view?: "daily" | "weekly" | "monthly";
  direction?: "vertical" | "horizontal";
  percent?: boolean;
  stacked?: boolean;
  showChartLegend?: boolean;
  legendPosition?: "bottom" | "right";
  showChartGridlineX?: boolean;
  showChartGridlineY?: boolean;
  showLineChartGradient?: boolean;
  xAxisType?: "category" | "time";
  tooltipMode?: "date" | "label";
  showChartLabelsX?: boolean;
  showChartLabelsY?: boolean;
  pieChartCutout?: number;
  pieChartType?: "pie" | "donut";
}

const ChartContainer = memo(
  ({
    id,
    loading,
    chartData,
    type,
    width,
    height,
    view,
    direction,
    percent,
    stacked,
    showChartLegend,
    legendPosition,
    showChartGridlineX,
    showChartGridlineY,
    showLineChartGradient,
    xAxisType,
    tooltipMode,
    showChartLabelsX,
    showChartLabelsY,
    pieChartCutout,
    pieChartType,
  }: ChartContainerProps) => {
    const memoizedChartData = useMemo(() => {
      if (!chartData) return null;
      return chartData;
    }, [chartData]);

    if (loading) {
      return (
        <div className="h-full w-full overflow-hidden">
          <div className="w-full h-full mt-5 pb-10 px-5 pb-5">
            <div className="w-full h-full bg-frost-gray-200 rounded animate-pulse" />
          </div>
        </div>
      );
    }

    if (!memoizedChartData) {
      return (
        <div className="h-full w-full overflow-hidden">
          <div className="w-full h-full px-5 pb-5" />
        </div>
      );
    }

    // Render chart based on type
    return (
      <div className="h-full w-full overflow-hidden">
        {type === "bar" ? (
          <BarChart
            id={id}
            data={memoizedChartData}
            direction={direction}
            percent={percent}
            stacked={stacked}
            showChartLegend={showChartLegend}
            legendPosition={legendPosition}
            showChartGridlineX={showChartGridlineX}
            showChartGridlineY={showChartGridlineY}
            showChartLabelsX={showChartLabelsX}
            showChartLabelsY={showChartLabelsY}
          />
        ) : type === "pie" ? (
          <PieChart
            id={id}
            data={memoizedChartData}
            percent={percent}
            showChartLegend={showChartLegend}
            legendPosition={legendPosition}
            showChartGridlineX={showChartGridlineX}
            showChartGridlineY={showChartGridlineY}
            showChartLabelsX={showChartLabelsX}
            showChartLabelsY={showChartLabelsY}
            cutout={pieChartType === "donut" ? pieChartCutout || 20 : 0}
            stacked={stacked}
          />
        ) : (
          <LineChart
            data={memoizedChartData}
            showChartLegend={showChartLegend}
            showChartGridlineX={showChartGridlineX}
            showChartGridlineY={showChartGridlineY}
            showLineChartGradient={showLineChartGradient}
            showChartLabelsX={showChartLabelsX}
            showChartLabelsY={showChartLabelsY}
            xAxisType={xAxisType}
            view={view}
            tooltipMode={tooltipMode}
            legendPosition={legendPosition}
          />
        )}
      </div>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

export default ChartContainer;
