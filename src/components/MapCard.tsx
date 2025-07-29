import React, { useState } from "react";
import AustraliaMap from "react-australia-map";
import CardHeader from "./CardElements/CardHeader";
import type { CardConfig } from "../config/cardConfigs";
import { useCsvData } from "../hooks/usePrepareRawCsv";
import { formatValue } from "../utils/utils";
import "../assets/css/global.css";

interface MapCardProps {
  config: CardConfig;
}

// State label positions for AustraliaMap (as percentages for responsive positioning)
const stateLabelPositions = {
  NSW: { x: 0.85, y: 0.59 },
  VIC: { x: 0.8, y: 0.8 },
  QLD: { x: 0.77, y: 0.28 },
  SA: { x: 0.525, y: 0.533 },
  WA: { x: 0.15, y: 0.444 },
  NT: { x: 0.497, y: 0.3 },
  TAS: { x: 0.84, y: 0.93 },
  ACT: { x: 0.677, y: 0.711 },
  National: { x: 0.22, y: 0.86 },
};

// Custom font colors per state
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

// Add mapping from state code to full state name
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

type CsvRow = { state: keyof typeof stateLabelPositions; value: string };
type LegendEntry = {
  state: keyof typeof stateLabelPositions;
  value: string;
  color: string;
};

const MapCard: React.FC<MapCardProps> = ({ config }) => {
  const { data, loading } = useCsvData(config.csvUrl ?? "", "map");

  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Build customStyling from parsed data
  let customStyling: Record<string, any> = {};
  if (data && "rows" in data && Array.isArray(data.rows)) {
    type StateKey = keyof typeof stateLabelPositions;
    data.rows.forEach((row, idx) => {
      const state = row.state as StateKey;
      const value = row.value;
      if (!state || !value || !stateLabelPositions[state]) return;
      customStyling[state] = {
        showLabels: false, // Hide SVG labels
      };
    });
    // Ensure all states are present in customStyling
    Object.keys(stateLabelPositions).forEach((state) => {
      if (!customStyling[state]) {
        customStyling[state] = {
          showLabels: false,
        };
      }
    });
  }

  // Find the National value in your parsed data
  const nationalRow =
    data && "rows" in data && Array.isArray(data.rows)
      ? data.rows.find((row) => row.state === "National")
      : undefined;

  // Prepare overlay labels data
  let overlayLabels =
    data && "rows" in data && Array.isArray(data.rows)
      ? data.rows.filter(
          (row) =>
            stateLabelPositions[row.state as keyof typeof stateLabelPositions]
        )
      : [];
  // Add National row if present and not already included
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

  return (
    <div className="flex flex-col h-full bg-white shadow-xs rounded-xl">
      {config.showCardHeader && (
        <CardHeader
          loading={loading}
          title={data?.headerTitle || config.id}
          showCardHeaderBorder={config.showCardHeaderBorder}
        />
      )}
      <div className="flex-1 min-h-0 flex flex-col overflow-x-auto px-5 pt-5 pb-5">
        {loading ? (
          <div className="w-full h-full bg-frost-gray-200 rounded animate-pulse" />
        ) : (
          <>
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                aspectRatio: "4 / 3",
                minHeight: 190,
                maxHeight: 420,
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "15px",
                marginTop: "-15px",
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
                      fontSize: "clamp(10px, 1.5vw, 14px)",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      padding: "clamp(3px, 1vw, 6px) clamp(4px, 1.5vw, 8px)",
                      lineHeight: "1.3",
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
                            width: 20,
                            height: 20,
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
          </>
        )}
      </div>
      {/* Add hover effect styles */}
      <style>{`
        .map-label-overlay:hover {
          background: var(--color-teal-100) !important;
          color: var(--color-teal-700) !important;
        }
      `}</style>
    </div>
  );
};

export default MapCard;
