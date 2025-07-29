import { useMemo } from "react";
import { useCsvData } from "./usePrepareRawCsv";
import { useFormattedChartData } from "./useStyleParsedCsv";
import type { CardConfig } from "../config/cardConfigs";

import { parseISO, format, startOfWeek, startOfMonth } from "date-fns";

function isParsedSheetData(data: any): data is { chartData: any } {
  return data && typeof data === "object" && "chartData" in data;
}

export function useOptimizedCardData(
  config: CardConfig,
  view?: "daily" | "weekly" | "monthly"
) {
  const { csvUrl, chartType = "line", colors, id } = config;

  // For dashboard03, use the view to determine aggregation
  const parserType = useMemo(() => {
    if (config.parserType) return config.parserType;
    if (id === "dashboard03" && view) {
      return "dailyTimeSeries"; // Always fetch daily, aggregate in JS
    }
    if (chartType === "bar") return "widgetChart";
    if (chartType === "column") return "widgetChart";
    if (chartType === "pie") return "pieChart"; // Use dedicated pieChart parser
    if (chartType === "line_tall") return "monthlyTimeSeries";
    if (chartType === "line") return "monthlyTimeSeriesHardCoded";
    return "monthlyTimeSeriesHardCoded";
  }, [chartType, id, view, config.parserType]);

  const {
    data: parsedData,
    loading,
    error,
  } = useCsvData(csvUrl || "", parserType);

  // Aggregate daily data to weekly/monthly if needed
  const aggregatedData = useMemo(() => {
    if (
      id !== "dashboard03" ||
      !parsedData ||
      !view ||
      !("chartData" in parsedData) ||
      !parsedData.chartData
    ) {
      return parsedData;
    }
    if (view === "daily") {
      // Keep daily labels as ISO dates
      return parsedData;
    }
    // Aggregate to weekly or monthly
    const { labels, datasets } = parsedData.chartData;
    let groupFn;
    if (view === "weekly") {
      groupFn = (date: Date) =>
        format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    } else {
      groupFn = (date: Date) => format(startOfMonth(date), "yyyy-MM");
    }
    // Group data
    const grouped: Record<string, number[]> = {};
    const groupDates: Record<string, Date> = {};
    labels.forEach((dateStr: string, i: number) => {
      const date = parseISO(dateStr);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateStr);
      }
      const group = groupFn(date);
      groupDates[group] = groupDates[group] || date;
      if (!grouped[group]) grouped[group] = new Array(datasets.length).fill(0);
      datasets.forEach((ds: any, dsIdx: number) => {
        const val = (ds.data as any[])[i]?.y ?? (ds.data as any[])[i] ?? 0;
        grouped[group][dsIdx] += Number(val) || 0;
      });
    });
    const groupKeys = Object.keys(grouped);
    // Use group keys (ISO dates) as labels
    const newLabels = groupKeys;
    const newDatasets = datasets.map((ds: any, dsIdx: number) => ({
      ...ds,
      data: groupKeys.map((group) => grouped[group][dsIdx]),
    }));
    return {
      ...parsedData,
      chartData: {
        ...parsedData.chartData,
        labels: newLabels,
        datasets: newDatasets,
      },
    };
  }, [parsedData, id, view]);

  const formattingOptions = useMemo(
    () => ({
      colors,
      useGradient: true,
      chartType: chartType as import("./types").ChartType,
    }),
    [colors, chartType]
  );

  const safeAggregatedData = isParsedSheetData(aggregatedData)
    ? aggregatedData
    : null;
  const formattedData = useFormattedChartData(
    safeAggregatedData,
    formattingOptions
  );

  // Memoize the final formatted data to prevent unnecessary re-renders
  const memoizedFormattedData = useMemo(() => {
    return formattedData;
  }, [formattedData]);

  // Debug logging
  // console.log("useOptimizedCardData:", {
  //   configId: config.id,
  //   parsedData,
  //   aggregatedData,
  //   formattedData,
  //   memoizedFormattedData,
  //   loading,
  //   error,
  // });

  return { data: memoizedFormattedData, loading, error };
}
