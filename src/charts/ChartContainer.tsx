import { memo, useMemo } from "react";
import LoadingBlock from "../components/CardElements/LoadingBlock";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import PieChart from "./PieChart";

interface ChartContainerProps {
  id: string;
  loading: boolean;
  chartData: any;
  type: "line" | "bar" | "pie";
  view?: "daily" | "weekly" | "monthly";
  direction?: "horizontal" | "vertical";
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
    // Memoize chart data to prevent unnecessary re-renders
    const memoizedChartData = useMemo(() => {
      if (!chartData) return null;
      return chartData;
    }, [chartData]);

    // Memoize loading state to prevent unnecessary re-renders
    const isLoading = useMemo(() => loading, [loading]);

    // Memoize chart props to prevent unnecessary re-renders
    const chartProps = useMemo(
      () => ({
        id,
        data: memoizedChartData,
        direction,
        percent,
        stacked,
        showChartLegend,
        legendPosition,
        showChartGridlineX,
        showChartGridlineY,
        showChartLabelsX,
        showChartLabelsY,
        view,
        xAxisType,
        tooltipMode,
        showLineChartGradient,
        pieChartCutout,
        pieChartType,
      }),
      [
        id,
        memoizedChartData,
        direction,
        percent,
        stacked,
        showChartLegend,
        legendPosition,
        showChartGridlineX,
        showChartGridlineY,
        showChartLabelsX,
        showChartLabelsY,
        view,
        xAxisType,
        tooltipMode,
        showLineChartGradient,
        pieChartCutout,
        pieChartType,
      ]
    );

    if (isLoading) {
      return (
        <div className="h-full w-full overflow-hidden">
          <div className="w-full h-full px-5 pb-5 pt-8">
            <LoadingBlock size="custom" height="h-full" width="w-full" />
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
          <BarChart {...chartProps} />
        ) : type === "pie" ? (
          <PieChart {...chartProps} />
        ) : (
          <LineChart {...chartProps} />
        )}
      </div>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

export default ChartContainer;
