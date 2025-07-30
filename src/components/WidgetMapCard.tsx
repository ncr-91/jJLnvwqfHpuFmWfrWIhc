import React, { useState } from "react";
import LoadingBlock from "./CardElements/LoadingBlock";
import WidgetHeader from "./CardElements/WidgetHeader";

import type { CardConfig } from "../config/cardConfigs";
import { useCsvData } from "../hooks/usePrepareRawCsv";
import { cardSizeClasses } from "../config/cardConfigs";
import { formatValue } from "../utils/utils";
import AustraliaMap from "react-australia-map";
import "../assets/css/global.css";

interface WidgetMapCardProps {
  config: CardConfig;
}

// State label positions for AustraliaMap (as percentages for responsive positioning)
const stateLabelPositions = {
  NSW: { x: 0.833, y: 0.578 },
  VIC: { x: 0.867, y: 0.822 },
  QLD: { x: 0.8, y: 0.267 },
  SA: { x: 0.517, y: 0.533 },
  WA: { x: 0.2, y: 0.444 },
  NT: { x: 0.497, y: 0.267 },
  TAS: { x: 0.917, y: 0.924 },
  ACT: { x: 0.677, y: 0.711 },
  National: { x: 0.25, y: 0.889 },
};

const stateFontColors: Record<string, string> = {
  NSW: "var(--color-teal-600)",
  NT: "var(--color-teal-600)",
  QLD: "var(--color-teal-600)",
  WA: "var(--color-teal-600)",
  VIC: "var(--color-teal-600)",
  SA: "var(--color-teal-600)",
  TAS: "var(--color-teal-600)",
  ACT: "var(--color-teal-600)",
  National: "var(--color-teal-600)",
};

const stateFullNames: Record<string, string> = {
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  WA: "Western Australia",
  VIC: "Victoria",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  National: "National",
};

const WidgetMapCard: React.FC<WidgetMapCardProps> = ({ config }) => {
  const { data, loading, error } = useCsvData(config.csvUrl ?? "", "map");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const sizeClass = cardSizeClasses[config.size || "sm"];
  const rowSpanClass = config.rowSpan ? `row-span-${config.rowSpan}` : "";

  // Build customStyling from parsed data
  let customStyling: Record<string, any> = {};
  if (data && "rows" in data && Array.isArray(data.rows)) {
    type StateKey = keyof typeof stateLabelPositions;
    data.rows.forEach((row) => {
      const state = row.state as StateKey;
      const value = row.value;
      if (!state || !value || !stateLabelPositions[state]) return;
      customStyling[state] = {
        showLabels: false, // Hide SVG labels
      };
    });
    Object.keys(stateLabelPositions).forEach((state) => {
      if (!customStyling[state]) {
        customStyling[state] = {
          showLabels: false,
        };
      }
    });
  }

  // Prepare overlay labels data
  let overlayLabels =
    data && "rows" in data && Array.isArray(data.rows)
      ? data.rows.filter(
          (row) =>
            stateLabelPositions[row.state as keyof typeof stateLabelPositions]
        )
      : [];
  if (
    data &&
    "rows" in data &&
    Array.isArray(data.rows) &&
    data.rows.some((row) => row.state === "National") &&
    !overlayLabels.some((row) => row.state === "National")
  ) {
    const nationalRow = data.rows.find((row) => row.state === "National");
    if (nationalRow) overlayLabels = [...overlayLabels, nationalRow];
  }

  // Trend/total logic (optional, can be customized)
  // You can add trend/total display here if your map data supports it

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden relative ${sizeClass} ${rowSpanClass} bg-white shadow-xs rounded-xl`}
    >
      {config.showCardHeader && (
        <WidgetHeader
          loading={loading}
          title={data?.headerTitle || config.id}
          subtitle={
            config.showWidgetSubtitle && "subtitle" in (data || {})
              ? (data as any).subtitle
              : undefined
          }
          showWidgetHeaderBorder={config.showCardHeaderBorder}
        />
      )}
      <div className="flex-1 min-h-0 flex flex-col overflow-x-auto px-5 pt-5 pb-5">
        {loading ? (
          <LoadingBlock size="custom" height="h-full" width="w-full" />
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              aspectRatio: "4 / 3",
              minHeight: 150,
              maxHeight: 360,
              position: "relative",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              marginTop: "-18px",
            }}
          >
            <AustraliaMap
              fill="var(--color-frost-gray-200)"
              stroke="#ffffff"
              strokeWidth={1}
              width="100%"
              height="100%"
              title=""
              customize={customStyling}
            />
            {/* Overlay HTML labels */}
            {overlayLabels.map((row) => {
              const state = row.state as keyof typeof stateLabelPositions;
              const pos = stateLabelPositions[state];
              return (
                <div
                  key={row.state}
                  className="map-label-overlay"
                  style={{
                    position: "absolute",
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    border: "1px solid var(--color-frost-gray-100)",
                    color: stateFontColors[state] || "var(--color-teal-100)",
                    fontSize: "clamp(8px, 1.2vw, 12px)",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    padding: "clamp(2px, 0.8vw, 4px) clamp(3px, 1vw, 6px)",
                    lineHeight: "1.2",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: 4,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    transition: "background 0.2s, color 0.2s",
                    zIndex: 2,
                    textAlign: "center",
                    minWidth: "fit-content",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    setHoveredState(state);
                    const rect = (
                      e.target as HTMLElement
                    ).getBoundingClientRect();
                    setTooltipPos({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredState(null);
                    setTooltipPos(null);
                  }}
                >
                  {state === "National" ? (
                    <>
                      <img
                        src="https://hatscripts.github.io/circle-flags/flags/au.svg"
                        alt="Australian flag"
                        style={{
                          width: 16,
                          height: 16,
                          marginRight: 5,
                          display: "inline-block",
                          verticalAlign: "middle",
                          borderRadius: "50%",
                        }}
                      />
                      {formatValue(Number(row.value))}
                    </>
                  ) : (
                    formatValue(Number(row.value))
                  )}
                </div>
              );
            })}
            {/* Tooltip for state name */}
            {hoveredState && tooltipPos && (
              <div
                style={{
                  position: "fixed",
                  left: tooltipPos.x,
                  top: tooltipPos.y - 30,
                  background: "var(--color-oxford-blue-800)",
                  color: "var(--color-frost-gray-50)",
                  padding: "7px 10px",
                  borderRadius: 4,
                  fontSize: "var(--text-sm)",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: "1",
                  pointerEvents: "none",
                  zIndex: 9999,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {stateFullNames[hoveredState] || hoveredState}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        .map-label-overlay:hover {
          background: var(--color-teal-100) !important;
          color: var(--color-teal-700) !important;
        }
      `}</style>
    </div>
  );
};

export default WidgetMapCard;
