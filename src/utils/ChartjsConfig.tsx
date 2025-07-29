import { Chart, Tooltip } from "chart.js";
import type { ChartArea } from "chart.js";
import { getCssVar, hexToRgba } from "./cssColorHelper";

// Register Tooltip plugin
Chart.register(Tooltip);

// Chart.js default styles
Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;
Chart.defaults.font.size = 12;
Chart.defaults.color = getCssVar("--color-gray-500");

Object.assign(Chart.defaults.plugins.tooltip, {
  borderWidth: 1,
  displayColors: false,
  mode: "nearest",
  intersect: false,
  position: "nearest",
  caretSize: 0,
  caretPadding: 20,
  cornerRadius: 8,
  padding: 8,
});

/**
 * Generate a linear vertical gradient from bottom to top of a chart area
 * @param ctx - CanvasRenderingContext2D
 * @param chartArea - The chart area object from Chart.js
 * @param colorStops - Array of { stop, color } entries
 * @returns CanvasGradient or 'transparent' fallback
 */
export const chartAreaGradient = (
  ctx: CanvasRenderingContext2D | null,
  chartArea: ChartArea | null,
  colorStops: { stop: number; color: string }[] = []
): CanvasGradient | string => {
  if (!ctx || !chartArea || colorStops.length === 0) {
    return "transparent";
  }

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });

  return gradient;
};

// Theme-aware color palette
export const chartColors = {
  textColor: {
    light: getCssVar("--color-gray-400"),
    dark: getCssVar("--color-gray-500"),
  },
  gridColor: {
    light: getCssVar("--color-gray-100"),
    dark: hexToRgba(getCssVar("--color-gray-700"), 0.6),
  },
  backdropColor: {
    light: getCssVar("--color-white"),
    dark: getCssVar("--color-gray-800"),
  },
  tooltipTitleColor: {
    light: getCssVar("--color-gray-800"),
    dark: getCssVar("--color-gray-100"),
  },
  tooltipBodyColor: {
    light: getCssVar("--color-gray-500"),
    dark: getCssVar("--color-gray-400"),
  },
  tooltipBgColor: {
    light: getCssVar("--color-white"),
    dark: getCssVar("--color-gray-700"),
  },
  tooltipBorderColor: {
    light: getCssVar("--color-gray-200"),
    dark: getCssVar("--color-gray-600"),
  },
};
