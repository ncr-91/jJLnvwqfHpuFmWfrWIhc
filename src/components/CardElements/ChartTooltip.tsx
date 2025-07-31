import type { TooltipItem } from "chart.js";
import { formatValue } from "../../utils/utils";
import { parseISO, format, getISOWeek } from "date-fns";

export interface ChartTooltipOptions {
  chartType: "bar" | "line" | "pie" | "heatmap";
  percent?: boolean;
  direction?: "vertical" | "horizontal";
  stacked?: boolean;
  tooltipMode?: "date" | "label";
  view?: "daily" | "weekly" | "monthly";
  xAxisType?: "category" | "time";
  originalData?: any; // For bar charts to access original data
}

export const createBarChartTooltipCallbacks = (options: {
  percent?: boolean;
  direction?: "vertical" | "horizontal";
  stacked?: boolean;
  originalData?: any;
}) => {
  const { percent, direction, stacked, originalData } = options;

  const baseCallbacks = {
    title: () => "",
    bodySpacing: 4,
  };

  const horizontalCallbacks = {
    ...baseCallbacks,
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
          const originalValue =
            originalData?.datasets[context.datasetIndex!]?.data[
              context.dataIndex!
            ];

          const chartInstance = context.chart;
          const visibleDatasets = chartInstance.data.datasets.filter(
            (_, index) => chartInstance.isDatasetVisible(index)
          );

          const visibleTotal = visibleDatasets.reduce((sum, visibleDataset) => {
            const visibleDatasetIndex = chartInstance.data.datasets.findIndex(
              (ds) => ds === visibleDataset
            );
            const val =
              originalData?.datasets[visibleDatasetIndex]?.data[
                context.dataIndex!
              ];
            return sum + (typeof val === "number" ? val : 0);
          }, 0);

          const percentage =
            visibleTotal > 0
              ? (((originalValue as number) / visibleTotal) * 100).toFixed(1)
              : "0.0";
          formatted = `${formatValue(
            originalValue as number
          )} (${percentage}%)`;
        } else if (direction === "vertical" && !percent) {
          formatted = `${formatValue(value)}`;
        } else {
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
    afterBody: () => [],
  };

  const verticalCallbacks = {
    ...baseCallbacks,
    beforeBody: (tooltipItems: TooltipItem<"bar">[]) =>
      tooltipItems[0]?.label || "",
    label: (context: TooltipItem<"bar">) => {
      const datasetLabel = context.dataset.label || "";
      const rawValue = context.parsed.y;
      let value;
      if (percent) {
        value = `${rawValue}%`;
      } else if (stacked && direction === "horizontal") {
        const originalValue =
          originalData?.datasets[context.datasetIndex!]?.data[
            context.dataIndex!
          ];

        const chartInstance = context.chart;
        const visibleDatasets = chartInstance.data.datasets.filter((_, index) =>
          chartInstance.isDatasetVisible(index)
        );

        const visibleTotal = visibleDatasets.reduce((sum, visibleDataset) => {
          const visibleDatasetIndex = chartInstance.data.datasets.findIndex(
            (ds) => ds === visibleDataset
          );
          const val =
            originalData?.datasets[visibleDatasetIndex]?.data[
              context.dataIndex!
            ];
          return sum + (typeof val === "number" ? val : 0);
        }, 0);

        const percentage =
          visibleTotal > 0
            ? (((originalValue as number) / visibleTotal) * 100).toFixed(1)
            : "0.0";
        value = `${formatValue(originalValue as number)} (${percentage}%)`;
      } else if (direction === "vertical" && !percent) {
        value = `${formatValue(rawValue)}`;
      } else {
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
        (sum, item) => sum + (item.parsed.y || 0),
        0
      );
      let totalValue;
      if (percent) {
        totalValue = `${total}%`;
      } else if (stacked && direction === "horizontal") {
        totalValue = formatValue(total);
      } else {
        totalValue = formatValue(total);
      }
      return [`Total: ${totalValue}`];
    },
  };

  return direction === "horizontal" ? horizontalCallbacks : verticalCallbacks;
};

export const createLineChartTooltipCallbacks = (options: {
  percent?: boolean;
  tooltipMode?: "date" | "label";
  view?: "daily" | "weekly" | "monthly";
  originalData?: any;
}) => {
  const { percent, tooltipMode, view, originalData } = options;

  return {
    title: () => "",
    bodySpacing: 4,
    beforeBody: (tooltipItems: any[]) => {
      if (tooltipMode === "label") {
        const item = tooltipItems[0];
        const labels = item?.chart?.data?.labels;
        if (labels && typeof item?.dataIndex === "number") {
          return [String(labels[item.dataIndex])];
        }
        if (typeof item?.label === "string") return [item.label];
        if (typeof item?.parsed?.x === "string") return [item.parsed.x];
        return [""];
      } else {
        let date = null;
        const value = tooltipItems[0].parsed.x;
        if (typeof value === "string") {
          date = parseISO(value);
        } else if (typeof value === "number") {
          date = new Date(value);
        }
        if (!date || isNaN(date.getTime())) return [String(value)];
        if (view === "weekly") {
          return [`Week ${getISOWeek(date)}, ${format(date, "yyyy")}`];
        }
        if (view === "monthly") {
          return [format(date, "MMM yyyy")];
        }
        return [format(date, "dd-MM-yyyy")];
      }
    },
    label: (context: any) => {
      const datasetLabel = context.dataset.label || "";
      const value = formatValue(context.parsed.y);

      if (percent) {
        // In percentage mode, show both percentage and original value
        const originalDataPoint =
          originalData?.datasets[context.datasetIndex!]?.data[
            context.dataIndex!
          ];
        let originalValue;

        // Handle both number and {x, y} object formats
        if (
          originalDataPoint &&
          typeof originalDataPoint === "object" &&
          "y" in originalDataPoint
        ) {
          originalValue = originalDataPoint.y;
        } else if (typeof originalDataPoint === "number") {
          originalValue = originalDataPoint;
        } else {
          originalValue = 0;
        }

        // Remove $ sign from percentage value
        const percentageValue = value.replace("$", "");
        return `${datasetLabel}: ${percentageValue}% (${formatValue(
          originalValue
        )})`;
      }

      return `${datasetLabel}: ${value}`;
    },
    afterBody: (tooltipItems: any[]) => {
      const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);

      if (percent) {
        // In percentage mode, show total as percentage without $ sign
        const totalValue = formatValue(total).replace("$", "");
        return [`Total: ${totalValue}%`];
      }

      return [`Total: ${formatValue(total)}`];
    },
  };
};

export const createPieChartTooltipCallbacks = (options: {
  percent?: boolean;
}) => {
  const { percent } = options;

  return {
    title: () => "",
    beforeBody: (tooltipItems: TooltipItem<"pie">[]) =>
      tooltipItems[0]?.label || "",
    bodySpacing: 4,
    label: (context: TooltipItem<"pie">) => {
      const rawValue = context.parsed;
      const total = (context.dataset.data as number[]).reduce(
        (sum, val) => sum + (val || 0),
        0
      );
      const percentage =
        total > 0 ? ((rawValue / total) * 100).toFixed(1) : "0.0";
      const value = percent ? `${rawValue}%` : formatValue(rawValue);
      return `${value} (${percentage}%)`;
    },
  };
};

export const createHeatmapTooltipCallbacks = (options: {
  xLabels?: string[];
  yLabels?: string[];
  formatValue?: (value: number) => string;
}) => {
  const { xLabels, yLabels, formatValue: customFormatValue } = options;

  return {
    title: () => "",
    bodySpacing: 4,
    label: (context: any) => {
      const { xIndex, yIndex, value, intensity } = context;

      if (xLabels && yLabels && xIndex !== undefined && yIndex !== undefined) {
        const xLabel = xLabels[xIndex] || "";
        const yLabel = yLabels[yIndex] || "";
        const formattedValue = customFormatValue
          ? customFormatValue(value)
          : value.toLocaleString();

        return [
          `${xLabel}`,
          `${yLabel}: ${formattedValue}`,
          intensity > 0
            ? `${(intensity * 100).toFixed(1)}% of max`
            : "No activity",
        ];
      }

      return [`Value: ${value.toLocaleString()}`];
    },
  };
};

// Helper function for heatmap tooltip content (since heatmap doesn't use Chart.js)
export const createHeatmapTooltipContent = (options: {
  xLabels?: string[];
  yLabels?: string[];
  formatValue?: (value: number) => string;
  xIndex: number;
  yIndex: number;
  value: number;
  intensity: number;
}) => {
  const {
    xLabels,
    yLabels,
    formatValue: customFormatValue,
    xIndex,
    yIndex,
    value,
    intensity,
  } = options;

  if (xLabels && yLabels && xIndex !== undefined && yIndex !== undefined) {
    const xLabel = xLabels[xIndex] || "";
    const yLabel = yLabels[yIndex] || "";
    const formattedValue = customFormatValue
      ? customFormatValue(value)
      : value.toLocaleString();

    return {
      title: xLabel,
      content: [
        `${yLabel}: ${formattedValue}`,
        intensity > 0
          ? `${(intensity * 100).toFixed(1)}% of max`
          : "No activity",
      ],
    };
  }

  return {
    title: "Value",
    content: [`${value.toLocaleString()}`],
  };
};

// Legacy function for backward compatibility
export const createChartTooltipCallbacks = (options: ChartTooltipOptions) => {
  const { chartType, ...rest } = options;

  if (chartType === "bar") {
    return createBarChartTooltipCallbacks(rest);
  } else if (chartType === "line") {
    return createLineChartTooltipCallbacks(rest);
  } else if (chartType === "pie") {
    return createPieChartTooltipCallbacks(rest);
  } else if (chartType === "heatmap") {
    return createHeatmapTooltipCallbacks(rest as any);
  }

  return {
    title: () => "",
    bodySpacing: 4,
  };
};

export const getChartTooltipColors = (chartColors: any) => {
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;
  return {
    bodyColor: tooltipBodyColor?.light || "#000",
    backgroundColor: tooltipBgColor?.light || "#fff",
    borderColor: tooltipBorderColor?.light || "#ccc",
    borderWidth: 1,
  };
};
