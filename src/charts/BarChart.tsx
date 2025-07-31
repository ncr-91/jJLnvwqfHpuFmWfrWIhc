import { useRef, useEffect, useState, useMemo } from "react";
import { chartColors } from "../utils/ChartjsConfig";
import { Chart, type ChartData, type ChartOptions } from "chart.js";
import { createChartLegendPlugin } from "../components/CardElements/ChartLegend";
import {
  createBarChartTooltipCallbacks,
  getChartTooltipColors,
} from "../components/CardElements/ChartTooltip";
import { formatValue } from "../utils/utils";

interface BarChartStackedProps {
  id?: string;
  data: ChartData<"bar">;
  direction?: "vertical" | "horizontal";
  percent?: boolean;
  stacked?: boolean;
  showChartLegend?: boolean;
  legendPosition?: "bottom" | "right";
  showChartLabelsX?: boolean;
  showChartLabelsY?: boolean;
  showChartGridlineX?: boolean;
  showChartGridlineY?: boolean;
}

function BarChart({
  data,
  direction = "vertical",
  percent = false,
  stacked = false,
  showChartLegend = false,
  legendPosition = "bottom",
  showChartLabelsX = true,
  showChartLabelsY = true,
  showChartGridlineX = false,
  showChartGridlineY = true,
}: BarChartStackedProps) {
  const [chart, setChart] = useState<Chart<"bar"> | null>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const canvas = useRef<HTMLCanvasElement>(null);
  const legend = useRef<HTMLUListElement>(null);

  const normalizedData = useMemo(() => {
    if (!stacked || percent || direction === "vertical") return data;

    const normalized = {
      labels: data.labels,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map((value, index) => {
          const total = data.datasets.reduce((sum, ds) => {
            const val = ds.data[index];
            return sum + (typeof val === "number" ? val : 0);
          }, 0);

          return total > 0 ? ((value as number) / total) * 100 : 0;
        }),
      })),
    };

    return normalized;
  }, [data, stacked, percent, direction]);

  const recalculatePercentages = (chartInstance: Chart<"bar">) => {
    if (!stacked || percent || direction === "vertical") return;

    const visibleDatasets = chartInstance.data.datasets.filter((_, index) =>
      chartInstance.isDatasetVisible(index)
    );

    chartInstance.data.datasets.forEach((dataset, datasetIndex) => {
      dataset.data = dataset.data.map((_, index) => {
        const originalValue = data.datasets[datasetIndex].data[index] as number;

        const visibleTotal = visibleDatasets.reduce((sum, visibleDataset) => {
          const visibleDatasetIndex = chartInstance.data.datasets.findIndex(
            (ds) => ds === visibleDataset
          );
          const val = data.datasets[visibleDatasetIndex].data[index];
          return sum + (typeof val === "number" ? val : 0);
        }, 0);

        const percentage =
          visibleTotal > 0 ? (originalValue / visibleTotal) * 100 : 0;

        if (chartInstance.isDatasetVisible(datasetIndex)) {
          return Math.min(percentage, 100);
        }

        return percentage;
      });
    });

    chartInstance.update();
  };

  const updateAxisVisibility = (chartInstance: Chart<"bar">) => {
    if (!stacked || direction !== "horizontal") return;

    // Check the number of categories (data points) instead of datasets
    const numberOfCategories = chartInstance.data.labels?.length || 0;

    // For horizontal stacked charts, hide the Y-axis labels (category labels) when only one category is visible
    if (numberOfCategories <= 1) {
      if (
        chartInstance.options.scales &&
        chartInstance.options.scales.y &&
        chartInstance.options.scales.y.ticks
      ) {
        chartInstance.options.scales.y.ticks.display = false;
      }
      // Increase left and top padding when labels are hidden for better visual balance
      if (
        chartInstance.options.layout &&
        chartInstance.options.layout.padding
      ) {
        const padding = chartInstance.options.layout.padding;
        if (typeof padding === "object" && padding !== null) {
          (padding as any).left = 20;
          (padding as any).top = 20;
        }
      }
    } else {
      if (
        chartInstance.options.scales &&
        chartInstance.options.scales.y &&
        chartInstance.options.scales.y.ticks
      ) {
        chartInstance.options.scales.y.ticks.display = showChartLabelsY;
      }
      // Reset padding to default when labels are shown
      if (
        chartInstance.options.layout &&
        chartInstance.options.layout.padding
      ) {
        const padding = chartInstance.options.layout.padding;
        if (typeof padding === "object" && padding !== null) {
          (padding as any).left = 5;
          (padding as any).top = 0;
        }
      }
    }

    chartInstance.update("none");
  };

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;

    let chartInstance: Chart<"bar"> | null = null;

    const isHorizontal = direction === "horizontal";
    const isStacked = stacked;

    const indexAxis = isHorizontal ? "y" : "x";
    const valueAxis = isHorizontal ? "x" : "y";

    const htmlLegendPlugin = createChartLegendPlugin(legend, {
      chartType: "bar",
      onVisibilityChange: (_index, _isVisible) => {
        if (
          stacked &&
          direction === "horizontal" &&
          !percent &&
          chartInstance
        ) {
          recalculatePercentages(chartInstance);
        }

        // Don't update axis visibility on legend changes - it should stay based on category count
        // updateAxisVisibility(chartInstance);
      },
    });

    const tooltipCallbacks = createBarChartTooltipCallbacks({
      percent,
      direction,
      stacked,
      originalData: data,
    });

    const tooltipColors = getChartTooltipColors(chartColors);

    const calculateMaxForStacked = () => {
      if (!stacked || percent || direction === "vertical") return undefined;

      return 100;
    };

    const chartOptions: ChartOptions<"bar"> = {
      indexAxis,
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200,
      elements: {
        bar: {},
      },
      interaction: isHorizontal
        ? { mode: "nearest", intersect: true }
        : { mode: "index", intersect: false },
      scales: {
        [indexAxis]: {
          grid: {
            color: "#e5e7eb",
            display:
              indexAxis === "x" ? showChartGridlineX : showChartGridlineY,
          },
          border: {
            display: false,
          },
          stacked,
          ticks: {
            display: indexAxis === "x" ? showChartLabelsX : showChartLabelsY,
          },
        },
        [valueAxis]: {
          grid: {
            color: "#e5e7eb",
            display:
              valueAxis === "x" ? showChartGridlineX : showChartGridlineY,
          },
          border: {
            display: false,
          },
          stacked,
          max: calculateMaxForStacked(),
          ticks: {
            maxTicksLimit: 6,
            callback: (value) => {
              if (
                percent ||
                (!percent && stacked && direction === "horizontal")
              ) {
                return `${value}%`;
              } else {
                return formatValue(Number(value));
              }
            },
            maxRotation: 0,
            autoSkip: false,
            display: valueAxis === "x" ? showChartLabelsX : showChartLabelsY,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: tooltipCallbacks,
          displayColors: true,
          ...tooltipColors,
        },
      },
      animation: {
        duration: 500,
      },
    };

    // Helper function to get border radius for a dataset
    const getBorderRadius = (
      isLastDataset: boolean,
      isStacked: boolean,
      isHorizontal: boolean
    ) => {
      if (isStacked) {
        if (isLastDataset) {
          if (isHorizontal) {
            return {
              topLeft: 0,
              topRight: 4,
              bottomLeft: 0,
              bottomRight: 4,
            };
          } else {
            return {
              topLeft: 4,
              topRight: 4,
              bottomLeft: 0,
              bottomRight: 0,
            };
          }
        } else {
          return 0;
        }
      } else {
        if (isLastDataset) {
          if (isHorizontal) {
            return {
              topLeft: 0,
              topRight: 4,
              bottomLeft: 0,
              bottomRight: 4,
            };
          } else {
            return {
              topLeft: 4,
              topRight: 4,
              bottomLeft: 0,
              bottomRight: 0,
            };
          }
        } else {
          return 0;
        }
      }
    };

    const dataWithBorderRadius = {
      ...normalizedData,
      datasets: normalizedData.datasets.map((dataset, index) => {
        const isLastDataset = index === normalizedData.datasets.length - 1;
        return {
          ...dataset,
          borderRadius: getBorderRadius(isLastDataset, isStacked, isHorizontal),
          borderSkipped: false,
        };
      }),
    };

    chartInstance = new Chart<"bar">(ctx, {
      type: "bar",
      data: dataWithBorderRadius,
      options: chartOptions,
      plugins: [...(showChartLegend ? [htmlLegendPlugin] : [])],
    });

    // Border radius is already applied in dataWithBorderRadius
    chartInstance.update("none");

    // Set initial axis visibility for horizontal stacked charts
    if (stacked && direction === "horizontal") {
      updateAxisVisibility(chartInstance);
    }

    setChart(chartInstance);
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!chart) return;

    chart.data = normalizedData;

    if (isInitialRender) {
      chart.update();
      setIsInitialRender(false);
    } else {
      chart.update("none");
    }

    // Update axis visibility when data changes
    if (stacked && direction === "horizontal") {
      updateAxisVisibility(chart);
    }
  }, [chart, normalizedData, isInitialRender, stacked, direction]);

  useEffect(() => {
    if (!chart) return;

    const tooltipColors = getChartTooltipColors(chartColors);
    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.bodyColor = tooltipColors.bodyColor;
      chart.options.plugins.tooltip.backgroundColor =
        tooltipColors.backgroundColor;
      chart.options.plugins.tooltip.borderColor = tooltipColors.borderColor;
    }
    chart.update("none");
  }, [chart, chartColors]);

  return (
    <div
      className={`h-full w-full overflow-hidden ${
        legendPosition === "right" ? "flex" : "flex flex-col"
      }`}
    >
      <div
        className={`flex-1 min-h-0 -ml-2 px-4 py-2 ${
          showChartLegend && legendPosition === "bottom" ? "" : "mb-0"
        }`}
      >
        <canvas ref={canvas} style={{ width: "100%", height: "100%" }} />
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
            ref={legend}
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

export default BarChart;
