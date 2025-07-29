import { useState, useEffect } from "react";
import Papa from "papaparse";
import type {
  ParsedSheetData,
  ParsedTableData,
  ParserType,
  ChartData,
} from "./types";

// Cache for CSV requests to prevent duplicate fetches
const csvCache = new Map<
  string,
  Promise<ParsedSheetData | ParsedTableData | ParsedMapData>
>();

// Map data type for MapCard
export type MapDataRow = { state: string; value: string };
export type ParsedMapData = { rows: MapDataRow[]; headerTitle?: string };

export function useCsvData(csvUrl: string, parserType: ParserType) {
  const [data, setData] = useState<
    ParsedSheetData | ParsedTableData | ParsedMapData | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!csvUrl) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Check cache first
    const cacheKey = `${csvUrl}-${parserType}`;
    if (csvCache.has(cacheKey)) {
      csvCache
        .get(cacheKey)!
        .then((cachedData) => {
          setData(cachedData);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError" && err.message !== "Request aborted") {
            setError(err instanceof Error ? err.message : "Cache error");
          }
          setLoading(false);
        });
      return;
    }

    // Create new fetch promise and cache it only if successful
    const fetchPromise = fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.statusText}`);
        return res.text();
      })
      .then((csvText) => {
        try {
          const parsedData = parseSheetData(csvText, parserType);
          // Cache the result only if successful
          csvCache.set(cacheKey, Promise.resolve(parsedData));
          return parsedData;
        } catch (parseError: unknown) {
          const errorMessage =
            parseError instanceof Error ? parseError.message : "Parsing error";
          throw new Error(errorMessage);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError" && err.message !== "Request aborted") {
          const errorMessage =
            err instanceof Error ? err.message : "Network error";
          setError(errorMessage);
        }
        // Do not cache or return anything here
      });

    fetchPromise
      .then((parsedData) => {
        if (parsedData) setData(parsedData);
      })
      .catch((err) => {
        if (err.name !== "AbortError" && err.message !== "Request aborted") {
          setError(err instanceof Error ? err.message : "Network error");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [csvUrl, parserType]);

  return { data, loading, error };
}

function parseSheetData(
  csvText: string,
  parserType: ParserType
): ParsedSheetData | ParsedTableData | ParsedMapData {
  const parsed = Papa.parse<string[]>(csvText, {
    dynamicTyping: false,
    skipEmptyLines: true,
    header: false,
    delimiter: ",",
    quoteChar: '"',
    escapeChar: '"',
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
  }

  const rows = parsed.data;

  switch (parserType) {
    case "shareChart":
      return parseMediaShareBar(rows);
    case "shareChartExtended":
      return parseShareChartExtended(rows);
    case "dailyTimeSeries":
      return parseDailyRaw(rows);
    case "monthlyTimeSeriesHardCoded":
      return parseMonthlyStats(rows);
    case "monthlyTimeSeries":
      return parseMonthlyStatsForTimeSeries(rows);
    case "table":
      return parseTableData(rows);
    case "map":
      return parseMapData(rows);
    case "barChart":
      return parseCategoryStats(rows);
    case "widgetChart":
      return parseWidgetStats(rows);
    case "pieChart":
      return parsePieChart(rows);
  }
  throw new Error(`Unhandled parserType: ${parserType}`);
}

function parseMediaShareBar(rows: string[][]): ParsedSheetData {
  if (rows.length < 3) {
    return {
      headerTitle: "",
      chartData: { labels: [], datasets: [] },
    };
  }
  // Use the second row for series names (headers)
  const headers = rows[1];
  const seriesNames = headers.slice(1, 5);
  const categories = rows.slice(2, 5).map((row) => row[0]);

  const datasets = seriesNames.map((series, colIdx) => ({
    label: series,
    data: rows.slice(2, 5).map((row) => {
      const val = row[colIdx + 1];
      return val ? parseFloat(val.replace("%", "")) : 0;
    }),
  }));

  return {
    headerTitle: rows[1][6] || rows[0][0] || "",
    chartData: {
      labels: categories,
      datasets,
    },
  };
}

function parseShareChartExtended(rows: string[][]): ParsedSheetData {
  if (rows.length < 3) {
    return {
      headerTitle: "",
      chartData: { labels: [], datasets: [] },
    };
  }

  const seriesNames = rows[1].slice(1, 11);
  const categories = rows.slice(2, 11).map((row) => row[0]);

  const datasets = seriesNames.map((series, colIdx) => ({
    label: series,
    data: rows.slice(2, 11).map((row) => {
      const val = row[colIdx + 1];
      return val ? parseFloat(val.replace("%", "")) : 0;
    }),
  }));

  return {
    headerTitle: rows[1][12] || rows[0][0] || "",
    chartData: {
      labels: categories,
      datasets,
    },
  };
}

function parseDailyRaw(rows: string[][]): ParsedSheetData {
  // Use the second row as the header, but only columns A-D
  const header = rows[1].slice(0, 4);
  const dataRows = rows
    .slice(2)
    .filter((row) => row[0]) // skip empty rows
    .map((row) => row.slice(0, 4)); // only columns A-D

  const labels: string[] = [];
  const seriesData: number[][] = header.slice(1).map(() => []);

  dataRows.forEach((row) => {
    const date = row[0];
    if (!date) return;
    labels.push(date);
    row.slice(1).forEach((val, i) => {
      seriesData[i].push(Number(val) || 0);
    });
  });

  const datasets = seriesData.map((data, i) => ({
    label: header[i + 1] || `Series ${i + 1}`,
    data: data.map((y, idx) => ({ x: labels[idx], y })),
  }));

  return {
    headerTitle: rows[1][5] || "", // Cell F2
    chartData: {
      labels,
      datasets,
    },
  };
}

// Original monthly parser - keep as is
function parseMonthlyStats(rows: string[][]): ParsedSheetData {
  const headerTitle = rows[1]?.[4]?.trim() || "";
  const total = cleanNumber(rows[1]?.[7]);
  const currentMonthCount = cleanNumber(rows[1]?.[10]);
  const lastMonthCount = cleanNumber(rows[4]?.[10]);

  const fullMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Only use columns B and C for data
  const datasetLabels = rows[1]
    .slice(1, 3)
    .map((label, i) => label?.trim() || `Series ${i + 1}`);

  const dataRows = rows.slice(1, 14); // rows 2-14 inclusive
  const dataMaps = [new Map(), new Map()];

  dataRows.forEach((row) => {
    const monthLabel = row[0]?.trim();
    for (let i = 0; i < 2; i++) {
      const val = parseFloat(row[i + 1]);
      if (monthLabel) {
        dataMaps[i].set(monthLabel, isNaN(val) ? null : val);
      }
    }
  });

  const seriesData = dataMaps.map((dataMap) =>
    fullMonths.map((m) => dataMap.get(m) ?? null)
  );

  const chartData: ChartData = {
    labels: fullMonths,
    datasets: datasetLabels.map((label, i) => ({ label, data: seriesData[i] })),
  };

  return {
    headerTitle,
    total,
    currentMonthCount,
    lastMonthCount,
    chartData,
  };
}

// New parser for time series datasets compatible with LineChart
function parseMonthlyStatsForTimeSeries(rows: string[][]): ParsedSheetData {
  const headerTitle = rows[0]?.[0]?.trim() || "";

  // Dynamically get all dataset labels after the date column
  const datasetLabels = rows[1]
    .slice(1)
    .map((label, i) => label?.trim() || `Series ${i + 1}`);

  const dateLabels: string[] = [];
  const seriesData: { x: string; y: number | null }[][] = datasetLabels.map(
    () => []
  );

  const dataRows = rows.slice(2);
  dataRows.forEach((row) => {
    const dateLabel = row[0]?.trim();
    if (dateLabel) {
      dateLabels.push(dateLabel);
      for (let i = 0; i < datasetLabels.length; i++) {
        const val = parseFloat(row[i + 1]);
        seriesData[i].push({ x: dateLabel, y: isNaN(val) ? null : val });
      }
    }
  });

  const chartData: ChartData = {
    labels: dateLabels,
    datasets: datasetLabels.map((label, i) => ({ label, data: seriesData[i] })),
  };

  return {
    headerTitle,
    chartData,
  };
}

// Category stats parser
function parseCategoryStats(rows: string[][]): ParsedSheetData {
  const headerTitle = rows[1]?.[5]?.trim() || "";

  const datasetLabels = [
    rows[1]?.[1]?.trim() || "Series 1",
    rows[1]?.[2]?.trim() || "Series 2",
    rows[1]?.[3]?.trim() || "Series 3",
  ];

  const categoryLabels: string[] = [];
  const seriesData: number[][] = [[], [], []];

  const dataRows = rows.slice(2);
  dataRows.forEach((row) => {
    const categoryLabel = row[0]?.trim();

    if (categoryLabel) {
      categoryLabels.push(categoryLabel);

      const valueB = parseFloat(row[1]) || 0;
      const valueC = parseFloat(row[2]) || 0;
      const valueD = parseFloat(row[3]) || 0;

      seriesData[0].push(isNaN(valueB) ? 0 : valueB);
      seriesData[1].push(isNaN(valueC) ? 0 : valueC);
      seriesData[2].push(isNaN(valueD) ? 0 : valueD);
    }
  });

  const chartData: ChartData = {
    labels: categoryLabels,
    datasets: [
      { data: seriesData[0], label: datasetLabels[0] },
      { data: seriesData[1], label: datasetLabels[1] },
      { data: seriesData[2], label: datasetLabels[2] },
    ],
  };

  return {
    headerTitle,
    chartData,
  };
}

// Widget stats parser
function parseWidgetStats(rows: string[][]): ParsedSheetData {
  const headerTitle = rows[1]?.[5]?.trim() || "";
  const subtitle = rows[2]?.[5]?.trim() || "";

  const datasetLabels = [
    rows[1]?.[1]?.trim() || "Series 1",
    rows[1]?.[2]?.trim() || "Series 2",
  ];

  const categoryLabels: string[] = [];
  const seriesData: number[][] = [[], []];

  const dataRows = rows.slice(2);
  dataRows.forEach((row) => {
    const categoryLabel = row[0]?.trim();

    if (categoryLabel) {
      categoryLabels.push(categoryLabel);

      const valueB = parseFloat(row[1]) || 0;
      const valueC = parseFloat(row[2]) || 0;

      seriesData[0].push(isNaN(valueB) ? 0 : valueB);
      seriesData[1].push(isNaN(valueC) ? 0 : valueC);
    }
  });

  // Reference specific cells for current/last month counts
  const cleanNumber = (value: any) =>
    value == null || isNaN(value) ? null : Number(value);
  const currentMonthCount = cleanNumber(rows[1]?.[7]);
  const lastMonthCount = cleanNumber(rows[4]?.[7]);

  const chartData: ChartData = {
    labels: categoryLabels,
    datasets: [
      { data: seriesData[0], label: datasetLabels[0] },
      { data: seriesData[1], label: datasetLabels[1] },
    ],
  };

  return {
    headerTitle,
    subtitle,
    chartData,
    currentMonthCount,
    lastMonthCount,
  };
}

// New parser for table data
function parseTableData(rows: string[][]): ParsedTableData {
  if (!rows.length) {
    return {
      headerTitle: "",
      tableData: {
        columns: [],
        rows: [],
      },
    };
  }

  const headerTitle = rows[0][0] || "Table";
  const columns = rows[1] || [];
  const dataRows = rows.slice(2);

  return {
    headerTitle,
    tableData: {
      columns,
      rows: dataRows,
    },
  };
}

// Map parser for MapCard
function parseMapData(rows: string[][]): ParsedMapData {
  if (!rows || rows.length < 3) return { rows: [] };
  // Header title is cell D2 (row 1, col 3)
  const headerTitle = rows[1][3]?.trim() || undefined;
  // Data rows start from index 2
  const dataRows = rows.slice(2);
  const parsedRows: MapDataRow[] = dataRows
    .map((row) => ({
      state: row[0]?.trim() ?? "",
      value: row[1]?.trim() ?? "",
    }))
    .filter((row) => row.state && row.value);
  return { rows: parsedRows, headerTitle };
}

// Helper to clean numbers from strings
function cleanNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Pie chart parser - specifically designed for pie chart data structure
function parsePieChart(rows: string[][]): ParsedSheetData {
  if (rows.length < 3) {
    return {
      headerTitle: "",
      chartData: { labels: [], datasets: [] },
    };
  }

  // Get header title from cell F2 (row 1, col 5) or A1 (row 0, col 0)
  const headerTitle = rows[1]?.[5]?.trim() || rows[0]?.[0]?.trim() || "";

  const categories: string[] = [];
  const values: number[] = [];

  // Process data rows starting from row 2
  const dataRows = rows.slice(2);
  dataRows.forEach((row) => {
    const category = row[0]?.trim();
    const value = row[1]?.trim();

    if (category && value) {
      const cleanValue = value.replace(/[%,]/g, "");
      const numValue = parseFloat(cleanValue);

      if (!isNaN(numValue)) {
        categories.push(category);
        values.push(numValue);
      }
    }
  });

  // For pie charts, all categories go into a single dataset
  const chartData: ChartData = {
    labels: categories,
    datasets: [
      {
        label: headerTitle || "Categories", // Use header title or fallback
        data: values, // All values in a single dataset
      },
    ],
  };

  return {
    headerTitle,
    chartData,
  };
}
