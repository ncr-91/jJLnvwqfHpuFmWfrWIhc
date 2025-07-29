import { useMemo } from "react";
import { hexToRgba } from "../utils/cssColorHelper";
import { chartAreaGradient } from "../utils/ChartjsConfig";
import type { ParsedSheetData, ChartType } from "./types";

interface UseFormattedChartDataOptions {
  colors?: string[];
  useGradient?: boolean;
  chartType?: ChartType;
}

export const useFormattedChartData = (
  data: ParsedSheetData | null,
  options: UseFormattedChartDataOptions = {}
): ParsedSheetData | null => {
  const { colors = [], useGradient = true, chartType = "line" } = options;

  const formattedData = useMemo(() => {
    if (!data?.chartData) return null;
    if (!colors.length) return data; // Return original data if no colors provided

    const styledChartData = {
      ...data.chartData,
      datasets: data.chartData.datasets.map((dataset, index) => {
        const baseColor = colors[index] || colors[0];

        const baseConfig = {
          ...dataset,
          borderColor: baseColor,
          backgroundColor: baseColor,
        };

        if (chartType === "line") {
          const lineConfig = {
            ...baseConfig,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointBackgroundColor: baseColor,
            pointHoverBackgroundColor: baseColor,
            pointBorderWidth: 0,
            pointHoverBorderWidth: 0,
            clip: 20,
            tension: 0.2,
            fill: true,
          };

          if (useGradient) {
            return {
              ...lineConfig,
              backgroundColor: (context: any) => {
                const { ctx, chartArea } = context.chart;
                if (!chartArea) return null;
                return chartAreaGradient(ctx, chartArea, [
                  { stop: 0, color: hexToRgba(baseColor, 0) },
                  { stop: 1, color: hexToRgba(baseColor, 0.16) },
                ]);
              },
            };
          }

          return lineConfig;
        }

        if (chartType === "bar") {
          return {
            ...baseConfig,
            backgroundColor: hexToRgba(baseColor, 1),
            borderSkipped: false,
            borderColor: "#ffffff",
            borderWidth: 0.5,
            borderRadius: (ctx: any) => {
              const { chart, datasetIndex } = ctx;
              const visibleDatasetIndexes: number[] = chart.data.datasets
                .map((_: any, idx: number) => idx)
                .filter((idx: number) => !chart.getDatasetMeta(idx).hidden);

              const topDatasetIndex =
                visibleDatasetIndexes[visibleDatasetIndexes.length - 1];

              return datasetIndex === topDatasetIndex
                ? { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                : { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
            },
          };
        }

        if (chartType === "pie") {
          // For pie charts, create an array of colors for each slice
          const sliceColors = dataset.data.map((_, sliceIndex) => {
            const colorIndex = sliceIndex % colors.length;
            return hexToRgba(colors[colorIndex] || colors[0], 1);
          });

          return {
            ...baseConfig,
            backgroundColor: sliceColors,
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverBorderColor: "#ffffff",
          };
        }

        return baseConfig;
      }),
    };

    return {
      ...data,
      chartData: styledChartData,
    };
  }, [data, colors, useGradient, chartType]);

  return formattedData;
};
