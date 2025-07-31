import { useRef, useEffect, useMemo } from "react";
import { chartColors } from "../utils/ChartjsConfig.tsx";
import { Chart, type ChartData, type ChartOptions } from "chart.js";
import "chartjs-adapter-moment";
import { formatValue } from "../utils/utils";
import { parseISO, format, getISOWeek } from "date-fns";
import { createChartLegendPlugin } from "../components/CardElements/ChartLegend";
import {
  createLineChartTooltipCallbacks,
  getChartTooltipColors,
} from "../components/CardElements/ChartTooltip";

interface LineChartProps {
  data: ChartData<"line">;
  width?: number;
  height?: number;
  showChartLegend?: boolean;
  legendPosition?: "bottom" | "right";
  showChartGridlineX?: boolean;
  showChartGridlineY?: boolean;
  showLineChartGradient?: boolean;
  showChartLabelsX?: boolean;
  showChartLabelsY?: boolean;
  xAxisType?: "category" | "time";
  view?: "daily" | "weekly" | "monthly";
  tooltipMode?: "date" | "label";
  percent?: boolean;
}

function LineChart({
  data,
  showChartLegend = false,
  legendPosition = "bottom",
  showChartGridlineX = false,
  showChartGridlineY = false,
  showChartLabelsX = true,
  showChartLabelsY = true,
  xAxisType = "category",
  view = "monthly",
  tooltipMode = "date",
  percent = false,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);
  const hasRendered = useRef(false);

  const customLegendRef = useRef<HTMLUListElement | null>(null);

  // Calculate percentage data if percent mode is enabled
  const chartData = useMemo(() => {
    if (!percent || !data.datasets || data.datasets.length === 0) {
      return data;
    }

    const labels = data.labels || [];
    const datasets = data.datasets;

    // Calculate totals for each data point
    const totals = labels.map((_, index) => {
      return datasets.reduce((sum, dataset) => {
        const value = dataset.data[index];
        // Handle both number and {x, y} object formats (same logic as useOptimizedCardData)
        let numericValue;
        if (value && typeof value === "object" && "y" in value) {
          numericValue = value.y;
        } else if (typeof value === "number") {
          numericValue = value;
        } else {
          numericValue = 0;
        }
        return sum + numericValue;
      }, 0);
    });

    // Convert to percentages
    const percentageDatasets = datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((value, index) => {
        const total = totals[index];
        // Handle both number and {x, y} object formats
        let numericValue;
        if (value && typeof value === "object" && "y" in value) {
          numericValue = value.y;
        } else if (typeof value === "number") {
          numericValue = value;
        } else {
          numericValue = 0;
        }
        return total > 0 ? (numericValue / total) * 100 : 0;
      }),
    }));

    return {
      labels,
      datasets: percentageDatasets,
    };
  }, [data, percent]);

  // Create a stable data hash to prevent unnecessary re-renders
  const dataHash = useMemo(() => {
    return JSON.stringify({
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
      })),
      percent,
      view,
      xAxisType,
    });
  }, [chartData, percent, view, xAxisType]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const htmlLegendPlugin = createChartLegendPlugin(customLegendRef, {
      chartType: "line",
    });

    const plugins = [...(showChartLegend ? [htmlLegendPlugin] : [])];

    if (!chartRef.current) {
      chartRef.current = new Chart<"line">(ctx, {
        type: "line",
        data: chartData,
        options: {
          animation: {
            duration: 400,
          },
          layout: {
            padding: 20,
          },
          scales: {
            y: {
              display: showChartGridlineY,
              beginAtZero: true,
              min: 0,
              suggestedMax: 100,
              grid: {
                display: showChartGridlineY,
              },
              ticks: {
                maxTicksLimit: 6,
                callback: (value) => {
                  if (percent) {
                    return `${value}%`;
                  }
                  return formatValue(Number(value));
                },
                display: showChartLabelsY,
              },
              border: { display: false },
            },
            x:
              xAxisType === "time"
                ? {
                    type: "time",
                    time: {
                      unit:
                        view === "monthly"
                          ? "month"
                          : view === "weekly"
                          ? "week"
                          : "day",
                      tooltipFormat:
                        view === "daily"
                          ? "dd,MM,yy"
                          : view === "weekly"
                          ? "MMM yy"
                          : "MMM yy",
                      displayFormats: {
                        day: "dd-MM-yy",
                        week: "'Week' II- yy",
                        month: "MMM yy",
                      },
                    },
                    display: true,
                    border: { display: false },
                    grid: { display: showChartGridlineX },
                    ticks: {
                      autoSkipPadding: 48,
                      maxRotation: 0,
                      display: showChartLabelsX,
                      callback: function (value: any) {
                        let date: Date | null = null;
                        if (typeof value === "string") {
                          date = parseISO(value);
                        } else if (typeof value === "number") {
                          date = new Date(value);
                        } else if (value instanceof Date) {
                          date = value;
                        }
                        if (!date || isNaN(date.getTime())) return value;
                        if (view === "daily") return format(date, "dd-MM-yy");
                        if (view === "weekly")
                          return `Week ${getISOWeek(date)}, ${format(
                            date,
                            "yyyy"
                          )}`;
                        if (view === "monthly") return format(date, "MMM yy");
                        return value;
                      },
                    },
                    stacked: false,
                  }
                : {
                    type: "category",
                    display: true,
                    grid: { display: showChartGridlineX },
                    ticks: {
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 6,
                      display: showChartLabelsX,
                    },
                    border: { display: false },
                  },
          },
          plugins: {
            tooltip: {
              enabled: true,
              mode: "index",
              intersect: false,
              callbacks: createLineChartTooltipCallbacks({
                percent,
                tooltipMode,
                view,
                originalData: data,
              }),
              displayColors: true,
              ...getChartTooltipColors(chartColors),
            },
            legend: {
              display: false, // Always disable Chart.js legend for line charts
            },
          },
          interaction: {
            intersect: false,
            mode: "nearest",
          },
          maintainAspectRatio: false,
          resizeDelay: 200,
        } as ChartOptions<"line">,
        plugins,
      });
      hasRendered.current = true;
    } else {
      // Only update if data has actually changed
      const currentDataHash = JSON.stringify(chartRef.current.data);
      const newDataHash = JSON.stringify(chartData);

      if (currentDataHash !== newDataHash) {
        chartRef.current.data = chartData;
        if (!hasRendered.current) {
          chartRef.current.update("none");
          hasRendered.current = true;
        } else {
          chartRef.current.update("none"); // Use no animation to prevent jittering
        }
      }
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [
    dataHash,
    chartColors,
    showChartLegend,
    showChartGridlineX,
    showChartGridlineY,
    tooltipMode,
  ]);

  return (
    <div
      className={`h-full w-full overflow-hidden ${
        legendPosition === "right" ? "flex" : "flex flex-col"
      }`}
    >
      <div
        className={`flex-1 min-h-0 px-2 ${
          showChartLegend && legendPosition === "bottom" ? "" : "pb-2"
        }`}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {showChartLegend && (
        <div
          className={`flex-shrink-0 ${
            legendPosition === "bottom"
              ? "px-5 pt-2 pb-6"
              : "px-1 py-2 w-16 sm:w-20 md:w-24 lg:w-32"
          }`}
        >
          <ul
            ref={customLegendRef}
            className={`${
              legendPosition === "bottom"
                ? "flex flex-wrap justify-center -m-1"
                : "flex flex-col space-y-1 text-xs sm:text-sm"
            }`}
          ></ul>
        </div>
      )}
    </div>
  );
}

export default LineChart;
