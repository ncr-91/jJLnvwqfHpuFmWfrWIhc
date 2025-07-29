import React, { useRef, useEffect, useState, useMemo } from "react";
import { chartColors } from "../utils/ChartjsConfig";
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type TooltipItem,
} from "chart.js";
import { formatValue } from "../utils/utils";

Chart.register(
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

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
  // Legacy properties for backward compatibility
  showBarChartLabelsX?: boolean;
  showBarChartLabelsY?: boolean;
  showBarChartGridlinesX?: boolean;
  showBarChartGridlinesY?: boolean;
}

function BarChart({
  id,
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
  // Legacy properties for backward compatibility
  showBarChartLabelsX,
  showBarChartLabelsY,
  showBarChartGridlinesX,
  showBarChartGridlinesY,
}: BarChartStackedProps) {
  const [chart, setChart] = useState<Chart<"bar"> | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const legend = useRef<HTMLUListElement>(null);
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  // Normalize data for horizontal stacked charts to show percentages (like pie chart)
  const normalizedData = useMemo(() => {
    if (!stacked || percent || direction === "vertical") return data;

    // Create a copy of the data with normalized values
    const normalized = {
      labels: data.labels,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map((value, index) => {
          // Calculate total for this data point
          const total = data.datasets.reduce((sum, ds) => {
            const val = ds.data[index];
            return sum + (typeof val === "number" ? val : 0);
          }, 0);

          // Convert to percentage (like pie chart)
          return total > 0 ? ((value as number) / total) * 100 : 0;
        }),
      })),
    };

    return normalized;
  }, [data, stacked, percent, direction]);

  // Function to recalculate percentages when datasets are hidden/shown
  const recalculatePercentages = (chartInstance: Chart<"bar">) => {
    if (!stacked || percent || direction === "vertical") return;

    const visibleDatasets = chartInstance.data.datasets.filter((_, index) =>
      chartInstance.isDatasetVisible(index)
    );

    // Recalculate percentages based on visible datasets only
    chartInstance.data.datasets.forEach((dataset, datasetIndex) => {
      dataset.data = dataset.data.map((value, index) => {
        const originalValue = data.datasets[datasetIndex].data[index] as number;

        // Calculate total from visible datasets only
        const visibleTotal = visibleDatasets.reduce((sum, visibleDataset) => {
          const visibleDatasetIndex = chartInstance.data.datasets.findIndex(
            (ds) => ds === visibleDataset
          );
          const val = data.datasets[visibleDatasetIndex].data[index];
          return sum + (typeof val === "number" ? val : 0);
        }, 0);

        // Convert to percentage based on visible total
        return visibleTotal > 0 ? (originalValue / visibleTotal) * 100 : 0;
      });
    });

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

    const htmlLegendPlugin: Plugin<"bar"> = {
      id: "htmlLegend",
      afterUpdate(c) {
        const ul = legend.current;
        if (!ul) return;
        while (ul.firstChild) {
          ul.firstChild.remove();
        }
        c.data.datasets.forEach((dataset, index) => {
          const li = document.createElement("li");
          li.style.margin = "4px";
          const button = document.createElement("button");
          button.classList.add(
            "btn-xs",
            "text-sm",
            "bg-white",
            "border",
            "rounded-md",
            "border-gray-100",
            "text-gray-500",
            "hover:text-gray-900",
            "rounded-full"
          );
          const isVisible = c.isDatasetVisible(index);
          button.style.opacity = isVisible ? "1" : ".3";
          button.style.display = "flex";
          button.style.alignItems = "center";
          button.style.paddingTop = "2px";
          button.style.paddingBottom = "2px";
          button.style.paddingLeft = "6px";
          button.style.paddingRight = "6px";
          button.style.marginRight = "4px";
          button.style.transition = "background 0.2s, color 0.2s";
          button.style.background = isVisible
            ? "white"
            : "var(--color-teal-50)";
          button.onmouseenter = () => {
            button.style.background = "var(--color-teal-100)";
            button.style.color = "var(--color-teal-700)";
          };
          button.onmouseleave = () => {
            button.style.background = isVisible
              ? "white"
              : "var(--color-teal-50)";
            button.style.color = isVisible
              ? "var(--color-gray-500)"
              : "var(--color-gray-400)";
          };
          button.onclick = () => {
            c.setDatasetVisibility(index, !c.isDatasetVisible(index));

            // Recalculate percentages for horizontal stacked charts
            if (stacked && direction === "horizontal" && !percent) {
              recalculatePercentages(c);
            } else {
              c.update();
            }
          };
          const box = document.createElement("span");
          box.style.display = "block";
          box.style.width = "12px";
          box.style.height = "12px";
          box.style.borderRadius = "50%";
          box.style.marginRight = "8px";
          box.style.borderWidth = "3px";
          box.style.borderStyle = "solid";
          box.style.flexShrink = "0";
          let color = "#000";
          if (Array.isArray(dataset.backgroundColor)) {
            color = dataset.backgroundColor[0] as string;
          } else if (dataset.backgroundColor) {
            color = dataset.backgroundColor as string;
          } else if (Array.isArray(dataset.borderColor)) {
            color = dataset.borderColor[0] as string;
          } else if (dataset.borderColor) {
            color = dataset.borderColor as string;
          }
          box.style.borderColor = color;
          box.style.backgroundColor = "transparent";
          box.style.pointerEvents = "none";
          const labelSpan = document.createElement("span");
          labelSpan.style.pointerEvents = "none";
          const labelText = dataset.label || `Dataset ${index + 1}`;
          labelSpan.textContent = labelText;
          li.appendChild(button);
          button.appendChild(box);
          button.appendChild(labelSpan);
          ul.appendChild(li);
        });
      },
    };

    const horizontalTooltipCallbacks = {
      title: () => "",
      beforeBody: (tooltipItems: TooltipItem<"bar">[]) =>
        tooltipItems[0]?.label || "",
      label: (context: TooltipItem<"bar">) => {
        const datasetLabel = context.dataset.label || "";
        const value = context.raw;
        let formatted;
        if (typeof value === "number" && !isNaN(value)) {
          if (percent) {
            formatted = `${value}%`;
          } else if (stacked && direction === "horizontal") {
            // For horizontal stacked charts, show original volume value and dynamic percentage
            const originalValue =
              data.datasets[context.datasetIndex!].data[context.dataIndex!];

            // Get the chart instance to check visible datasets
            const chartInstance = context.chart;
            const visibleDatasets = chartInstance.data.datasets.filter(
              (_, index) => chartInstance.isDatasetVisible(index)
            );

            // Calculate total from visible datasets only
            const visibleTotal = visibleDatasets.reduce(
              (sum, visibleDataset) => {
                const visibleDatasetIndex =
                  chartInstance.data.datasets.findIndex(
                    (ds) => ds === visibleDataset
                  );
                const val =
                  data.datasets[visibleDatasetIndex].data[context.dataIndex!];
                return sum + (typeof val === "number" ? val : 0);
              },
              0
            );

            const percentage =
              visibleTotal > 0
                ? (((originalValue as number) / visibleTotal) * 100).toFixed(1)
                : "0.0";
            formatted = `${formatValue(
              originalValue as number
            )} (${percentage}%)`;
          } else if (direction === "vertical" && !percent) {
            // For vertical charts without percent mode, show only volume values
            formatted = `${formatValue(value)}`;
          } else {
            // Calculate percentage from volume data
            const total = (context.dataset.data as number[]).reduce(
              (sum, val) => sum + (val || 0),
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
            formatted = `${formatValue(value)} (${percentage}%)`;
          }
        } else {
          formatted = "—";
        }
        return `${datasetLabel}: ${formatted}`;
      },
      afterBody: () => [], // No total for horizontal
    };

    const verticalTooltipCallbacks = {
      title: () => "",
      beforeBody: (tooltipItems: TooltipItem<"bar">[]) =>
        tooltipItems[0]?.label || "",
      label: (context: TooltipItem<"bar">) => {
        const datasetLabel = context.dataset.label || "";
        const rawValue = context.parsed.y;
        let value;
        if (percent) {
          value = `${rawValue}%`;
        } else if (stacked && direction === "horizontal") {
          // For horizontal stacked charts, show original volume value and dynamic percentage
          const originalValue =
            data.datasets[context.datasetIndex!].data[context.dataIndex!];

          // Get the chart instance to check visible datasets
          const chartInstance = context.chart;
          const visibleDatasets = chartInstance.data.datasets.filter(
            (_, index) => chartInstance.isDatasetVisible(index)
          );

          // Calculate total from visible datasets only
          const visibleTotal = visibleDatasets.reduce((sum, visibleDataset) => {
            const visibleDatasetIndex = chartInstance.data.datasets.findIndex(
              (ds) => ds === visibleDataset
            );
            const val =
              data.datasets[visibleDatasetIndex].data[context.dataIndex!];
            return sum + (typeof val === "number" ? val : 0);
          }, 0);

          const percentage =
            visibleTotal > 0
              ? (((originalValue as number) / visibleTotal) * 100).toFixed(1)
              : "0.0";
          value = `${formatValue(originalValue as number)} (${percentage}%)`;
        } else if (direction === "vertical" && !percent) {
          // For vertical charts without percent mode, show only volume values
          value = `${formatValue(rawValue)}`;
        } else {
          // Calculate percentage from volume data
          const total = (context.dataset.data as number[]).reduce(
            (sum, val) => sum + (val || 0),
            0
          );
          const percentage =
            total > 0 ? ((rawValue / total) * 100).toFixed(1) : "0.0";
          value = `${formatValue(rawValue)} (${percentage}%)`;
        }
        return `${datasetLabel}: ${value}`;
      },
      afterBody: (tooltipItems: TooltipItem<"bar">[]) => {
        const total = tooltipItems.reduce(
          (sum: number, item: TooltipItem<"bar">) => sum + (item.parsed.y ?? 0),
          0
        );
        let totalValue;
        if (percent) {
          totalValue = `${total}%`;
        } else {
          totalValue = formatValue(total);
        }
        return [`Total: ${totalValue}`];
      },
    };

    // Calculate maximum for horizontal stacked charts to show all data series
    const calculateMaxForStacked = () => {
      if (!stacked || percent || direction === "vertical") return undefined;

      // For horizontal stacked charts showing percentages, cap at 100%
      return 100;
    };

    const chartOptions: ChartOptions<"bar"> = {
      indexAxis,
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200,
      elements: {
        bar: {
          borderRadius: 4,
        },
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
                // Show percentages for percent mode or horizontal stacked charts
                return `${value}%`;
              } else {
                // Show formatted values for non-percent mode or vertical charts
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
          callbacks:
            direction === "horizontal"
              ? horizontalTooltipCallbacks
              : verticalTooltipCallbacks,
          displayColors: true,
          bodySpacing: 4,
          bodyColor: tooltipBodyColor?.light || "#000",
          backgroundColor: tooltipBgColor?.light || "#fff",
          borderColor: tooltipBorderColor?.light || "#ccc",
        },
      },
      animation: {
        duration: 500,
      },
    };

    chartInstance = new Chart<"bar">(ctx, {
      type: "bar",
      data: normalizedData,
      options: chartOptions,
      plugins: [htmlLegendPlugin],
    });

    // Apply border radius to all bars after chart creation
    if (chartInstance.data.datasets) {
      chartInstance.data.datasets.forEach((dataset, index) => {
        if (isStacked) {
          // For stacked charts, only round the appropriate corners of the topmost dataset
          if (index === chartInstance.data.datasets.length - 1) {
            if (isHorizontal) {
              // For horizontal stacked charts, round the right corners
              dataset.borderRadius = {
                topLeft: 0,
                topRight: 4,
                bottomLeft: 0,
                bottomRight: 4,
              };
            } else {
              // For vertical stacked charts, round the top corners
              dataset.borderRadius = {
                topLeft: 4,
                topRight: 4,
                bottomLeft: 0,
                bottomRight: 0,
              };
            }
          } else {
            dataset.borderRadius = 0; // No rounding for middle/bottom segments
          }
        } else {
          // For non-stacked charts, round the appropriate corners based on direction
          if (isHorizontal) {
            // For horizontal charts, round the right corners
            dataset.borderRadius = {
              topLeft: 0,
              topRight: 4,
              bottomLeft: 0,
              bottomRight: 4,
            };
          } else {
            // For vertical charts, round the top corners
            dataset.borderRadius = 4;
          }
        }
        dataset.borderSkipped = false; // This ensures border radius is applied
      });
      chartInstance.update("none"); // Update without animation
    }

    setChart(chartInstance);
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [
    normalizedData,
    direction,
    percent,
    stacked,
    showChartLegend,
    showChartLabelsX,
    showChartLabelsY,
    showChartGridlineX,
    showChartGridlineY,
  ]);

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
