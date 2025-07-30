import { memo, useMemo, useState, useCallback, useRef } from "react";
import LoadingBlock from "./CardElements/LoadingBlock";
import { useOptimizedCardData } from "../hooks/useOptimizedCardData";
import HeaderTitle from "./CardElements/CardHeader";
import CardActionButton from "./CardElements/CardActionButton";
import type { CardConfig } from "../config/cardConfigs";
import { cardSizeClasses } from "../config/cardConfigs";
import Sterno from "jsheatmap";

interface HeatMapCardProps {
  config: CardConfig;
}

const HeatMapCard = ({ config }: HeatMapCardProps) => {
  const { data, loading, error } = useOptimizedCardData(config);
  if (!("chartType" in config)) {
    return (
      <div className="text-red-500">Invalid card type for heat map card</div>
    );
  }
  return (
    <SingleHeatMapCard
      data={data}
      loading={loading}
      error={error}
      config={config}
    />
  );
};

interface SingleHeatMapCardProps {
  data: any;
  loading: boolean;
  error: string | null;
  config: CardConfig;
}

const SingleHeatMapCard = memo(
  ({ data, loading, error, config }: SingleHeatMapCardProps) => {
    const [viewMode, setViewMode] = useState<"heatmap" | "table">("heatmap");
    const [tooltip, setTooltip] = useState<{
      show: boolean;
      x: number;
      y: number;
      content: string;
    }>({ show: false, x: 0, y: 0, content: "" });
    const { chartType, size, rowSpan } = config;
    const legendRef = useRef<HTMLUListElement>(null);
    const sizeClass = cardSizeClasses[size || "sm"];
    const rowSpanClass = rowSpan ? `row-span-${rowSpan}` : "";

    // Legend items for the heatmap - using exact same colors as heatmap cells
    const legendItems = useMemo(
      () => [
        { color: "#f0fdfc", label: "None" },
        { color: "#ccfbf1", label: "Low" },
        { color: "#00a89e", label: "Medium" },
        { color: "#134e4a", label: "High" },
      ],
      []
    );

    const handleViewModeChange = useCallback(() => {
      setViewMode((prev: "heatmap" | "table") =>
        prev === "heatmap" ? "table" : "heatmap"
      );
    }, []);

    // Transform data for jsheatmap Sterno utility
    const heatMapData = useMemo(() => {
      if (!data?.chartData?.labels || !data?.chartData?.datasets) {
        return { data: [], xLabels: [], yLabels: [], sternoData: null };
      }

      const { labels, datasets } = data.chartData;

      // For monthly data, we can use the dates directly
      const dates = labels.filter(
        (dateStr: string) => dateStr && dateStr.includes("-")
      );

      // Get media types from datasets
      const mediaTypes = datasets.map(
        (dataset: any) => dataset.label || "Unknown"
      );

      // Format date labels for display
      const xLabels = dates.map((dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
          month: "short",
        });
      });

      // Create data matrix for heatmap
      const dataMatrix = mediaTypes.map((mediaType: string) => {
        const dataset = datasets.find((d: any) => d.label === mediaType);
        if (!dataset) return dates.map(() => 0);

        return dates.map((dateStr: string, index: number) => {
          const dataPoint = dataset.data.find((d: any) => d.x === dateStr);
          return dataPoint?.y || 0;
        });
      });

      // Create Sterno instance for data processing
      const sterno = new Sterno(
        xLabels,
        dataMatrix.map((row: number[], index: number) => [
          mediaTypes[index],
          row,
        ])
      );

      return {
        data: dataMatrix,
        xLabels: xLabels,
        yLabels: mediaTypes,
        sternoData: sterno.getData(),
      };
    }, [data]);

    // Calculate color intensity for a value
    const getColorIntensity = useCallback((value: number, maxValue: number) => {
      if (maxValue === 0) return 0;
      return Math.min(value / maxValue, 1);
    }, []);

    // Teal gradient with 4 levels - improved with #00a89e as medium
    const getColor = useCallback((intensity: number) => {
      if (intensity === 0) return "#f0fdfc"; // None - very light teal
      if (intensity < 0.33) return "#ccfbf1"; // Low - light teal
      if (intensity < 0.66) return "#00a89e"; // Medium - your specified color
      return "#134e4a"; // High - darkest teal
    }, []);

    // Get max value for color scaling
    const maxValue = useMemo(() => {
      if (!heatMapData.data.length) return 0;
      return Math.max(...heatMapData.data.flat());
    }, [heatMapData.data]);

    // Tooltip handlers
    const handleMouseEnter = useCallback(
      (value: number, xLabel: string, yLabel: string, x: number, y: number) => {
        const intensity = getColorIntensity(value, maxValue);
        const percentage = maxValue > 0 ? (intensity * 100).toFixed(1) : 0;

        setTooltip({
          show: true,
          x,
          y,
          content: `${xLabel}: ${yLabel} = ${value.toLocaleString()}\n${percentage}% of max`,
        });
      },
      [getColorIntensity, maxValue]
    );

    const handleMouseLeave = useCallback(() => {
      setTooltip({ show: false, x: 0, y: 0, content: "" });
    }, []);

    if (error) return <div className="text-red-500">Error: {error}</div>;

    const isDataEmpty =
      !data ||
      (typeof data === "object" &&
        !data.chartData &&
        !data.headerTitle &&
        Object.keys(data).length === 0);

    if (!loading && !error && isDataEmpty) return <div>No data available</div>;

    return (
      <div
        className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
      >
        {config.showCardHeader && (
          <HeaderTitle
            loading={loading}
            title={data?.headerTitle || config.id}
            showCardHeaderBorder={config.showCardHeaderBorder}
          />
        )}

        {config.showDropdownMenu && (
          <div className="absolute top-4 right-4">
            <CardActionButton>
              {(close) => (
                <li>
                  <button
                    onClick={() => {
                      handleViewModeChange();
                      close();
                    }}
                    className="flex items-center gap-2 w-full text-sm font-semibold text-left px-4 py-2 text-frost-gray-700 hover:bg-gray-100 transition duration-15"
                  >
                    <span className="material-symbols-outlined">
                      {viewMode === "heatmap"
                        ? "data_table"
                        : "calendar_view_month"}
                    </span>
                    <span>{viewMode === "heatmap" ? "Table" : "Heat Map"}</span>
                  </button>
                </li>
              )}
            </CardActionButton>
          </div>
        )}

        <div className="flex-1 p-4">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <LoadingBlock size="custom" height="h-full" width="w-full" />
            </div>
          ) : viewMode === "heatmap" ? (
            <div className="h-full w-full flex flex-col">
              {heatMapData.data.length > 0 ? (
                <>
                  <div className="flex-1 min-h-0">
                    <div className="h-full w-full flex flex-col">
                      {/* Y-axis labels */}
                      <div className="flex">
                        <div className="w-36 flex-shrink-0"></div>
                        <div
                          className="flex-1 grid gap-1 pr-2"
                          style={{
                            gridTemplateColumns: `repeat(${heatMapData.xLabels.length}, minmax(20px, 1fr))`,
                          }}
                        >
                          {heatMapData.xLabels.map(
                            (label: string, index: number) => (
                              <div
                                key={index}
                                className="text-xs font-medium text-frost-gray-700 text-center py-1 truncate flex items-center justify-center"
                                title={label}
                              >
                                {label}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Heatmap grid */}
                      <div className="flex-1 flex">
                        {/* Y-axis labels */}
                        <div className="w-36 flex-shrink-0 flex flex-col">
                          {heatMapData.yLabels.map(
                            (label: string, index: number) => (
                              <div
                                key={index}
                                className="text-xs font-medium text-frost-gray-700 text-right pr-2 flex items-center justify-end overflow-hidden"
                                title={label}
                                style={{ height: "100%" }}
                              >
                                <span className="truncate block w-full">
                                  {label}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        {/* Heatmap cells */}
                        <div
                          className="flex-1 grid gap-1 pr-2"
                          style={{
                            gridTemplateColumns: `repeat(${heatMapData.xLabels.length}, minmax(20px, 1fr))`,
                            gridTemplateRows: `repeat(${heatMapData.yLabels.length}, 1fr)`,
                          }}
                        >
                          {heatMapData.data.map(
                            (row: number[], yIndex: number) =>
                              row.map((value: number, xIndex: number) => {
                                const intensity = getColorIntensity(
                                  value,
                                  maxValue
                                );
                                const backgroundColor = getColor(intensity);

                                return (
                                  <div
                                    key={`${yIndex}-${xIndex}`}
                                    className="border border-gray-200 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md relative group"
                                    style={{ backgroundColor }}
                                  >
                                    {/* Removed text display - cells show only color */}

                                    {/* Tooltip */}
                                    <div
                                      className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
                                      style={{
                                        backgroundColor: "var(--color-white)",
                                        color: "var(--color-gray-500)",
                                        border:
                                          "1px solid var(--color-gray-200)",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        boxShadow:
                                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                        fontFamily: '"Inter", sans-serif',
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        lineHeight: "1.1",
                                        left:
                                          xIndex >=
                                          heatMapData.xLabels.length - 2
                                            ? "auto"
                                            : "50%",
                                        right:
                                          xIndex >=
                                          heatMapData.xLabels.length - 2
                                            ? "0"
                                            : "auto",
                                        transform:
                                          xIndex >=
                                          heatMapData.xLabels.length - 2
                                            ? "none"
                                            : "translateX(-50%)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          marginBottom: "4px",
                                          fontWeight: "600",
                                        }}
                                      >
                                        {heatMapData.xLabels[xIndex]}
                                      </div>
                                      <div style={{ marginBottom: "4px" }}>
                                        {heatMapData.yLabels[yIndex]}:{" "}
                                        {value.toLocaleString()}
                                      </div>
                                      <div style={{ marginBottom: "0" }}>
                                        {intensity > 0
                                          ? `${(intensity * 100).toFixed(
                                              1
                                            )}% of max`
                                          : "No activity"}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom HTML Legend - 5 levels */}
                  <div className="mt-4 flex items-center justify-center">
                    <ul className="flex items-center space-x-2" ref={legendRef}>
                      {legendItems.map((item, index) => (
                        <li key={index} style={{ margin: "4px" }}>
                          <button
                            className="btn-xs text-sm bg-white border rounded-md border-gray-100 text-frost-gray-500 hover:text-frost-gray-700 rounded-full flex items-center"
                            style={{
                              paddingTop: "2px",
                              paddingBottom: "2px",
                              paddingLeft: "6px",
                              paddingRight: "6px",
                              marginRight: "4px",
                              transition: "background 0.2s, color 0.2s",
                              fontSize: "0.875rem", // text-sm equivalent
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--color-teal-100)";
                              e.currentTarget.style.color =
                                "var(--color-teal-700)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "white";
                              e.currentTarget.style.color =
                                "var(--color-frost-gray-500)";
                            }}
                          >
                            <span
                              className="block rounded-full mr-2 flex-shrink-0"
                              style={{
                                width: "12px",
                                height: "12px",
                                borderWidth: "3px",
                                borderStyle: "solid",
                                borderColor: item.color,
                                backgroundColor: "transparent",
                                borderRadius: "50%",
                              }}
                            />
                            <span style={{ fontSize: "0.875rem" }}>
                              {item.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  No heat map data available
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full overflow-auto">
              {data?.chartData ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    {data.headerTitle || "Data Table"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.chartData.labels?.length || 0} data points
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No table data available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SingleHeatMapCard.displayName = "SingleHeatMapCard";

export default HeatMapCard;
