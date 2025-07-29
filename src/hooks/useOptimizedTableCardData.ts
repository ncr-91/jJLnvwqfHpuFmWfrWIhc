import { useMemo } from "react";
import { useCsvData } from "./usePrepareRawCsv";
import type { ParsedTableData } from "./types";
import type { CardConfig } from "../config/cardConfigs";

export function useOptimizedTableCardData(config: CardConfig) {
  const { csvUrl } = config;

  const {
    data: parsedData,
    loading,
    error,
  } = useCsvData(csvUrl || "", config.parserType || "table");

  const formattedData = useMemo<ParsedTableData | null>(() => {
    if (!parsedData) return null;

    // Narrow type: check if parsedData has tableData property
    if ("tableData" in parsedData) {
      const { columns, rows } = parsedData.tableData;

      if (!rows.length) return null;

      return {
        headerTitle: parsedData.headerTitle || columns[0] || "Table",
        tableData: {
          columns,
          rows,
        },
      };
    }

    // If parsedData is not a table, return null or handle differently
    return null;
  }, [parsedData]);

  return {
    data: formattedData,
    loading,
    error,
  };
}
