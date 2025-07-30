import { memo } from "react";
import LoadingBlock from "./CardElements/LoadingBlock";
import { useOptimizedTableCardData } from "../hooks/useOptimizedTableCardData";
import CardHeader from "./CardElements/CardHeader";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";

interface TableCardProps {
  config: CardConfig;
}

const TableCard = ({ config }: TableCardProps) => {
  if (config.type !== "table") {
    return <div className="text-red-500">Invalid card type for table card</div>;
  }
  const { data, loading, error } = useOptimizedTableCardData(config);
  return (
    <SingleTableCard
      data={data}
      loading={loading}
      error={error}
      config={config}
    />
  );
};

interface SingleTableCardProps {
  data: {
    headerTitle?: string;
    tableData?: {
      columns: string[];
      rows: (string | number)[][];
    };
  } | null;
  loading: boolean;
  error: string | null;
  config: CardConfig;
}

const SingleTableCard = memo(
  ({ data, loading, error, config }: SingleTableCardProps) => {
    const sizeClass = cardSizeClasses[config.size || "md"];
    const rowSpanClass = config.rowSpan ? `row-span-${config.rowSpan}` : "";

    const numCols = data?.tableData?.columns.length || 0;

    if (error) return <div className="text-red-500">Error: {error}</div>;
    const isDataEmpty =
      !data ||
      !data.tableData ||
      !data.tableData.columns.length ||
      !data.tableData.rows.length;
    if (!loading && !error && isDataEmpty) return <div>No data available</div>;

    return (
      <div
        className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
      >
        <div className="relative">
          <CardHeader
            loading={loading}
            title={loading ? undefined : data?.headerTitle || "Table"}
            showCardHeaderBorder={config.showCardHeaderBorder}
          />
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-x-auto px-5 pt-5 pb-5">
          {loading ? (
            <LoadingBlock size="custom" height="h-full" width="w-full" />
          ) : data?.tableData?.columns.length &&
            data?.tableData?.rows.length ? (
            <div className="overflow-x-auto flex-1 min-h-0">
              <table className="min-w-0 w-full h-full min-h-0">
                <thead className="text-xs uppercase text-oxford-blue-500 bg-gray-50">
                  <tr>
                    {data?.tableData?.columns.map((col, i) => (
                      <th
                        key={i}
                        className={`p-2 text-oxford-blue-900 font-semibold ${
                          i < numCols - 3 ? "text-left" : "text-center"
                        } overflow-hidden whitespace-normal`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-gray-100">
                  {data?.tableData?.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`p-2 text-frost-gray-800 ${
                            cellIndex < numCols - 3
                              ? "text-left"
                              : "text-center"
                          } overflow-hidden whitespace-normal`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 italic">No table data available</div>
          )}
        </div>
      </div>
    );
  }
);

SingleTableCard.displayName = "SingleTableCard";

export default TableCard;
