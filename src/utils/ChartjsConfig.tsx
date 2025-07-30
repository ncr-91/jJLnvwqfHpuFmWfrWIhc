import {
  Chart,
  Tooltip,
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  Legend,
} from "chart.js";
import type { ChartArea } from "chart.js";
import { getCssVar, hexToRgba } from "./cssColorHelper";

// Register all plugins globally to prevent conflicts
Chart.register(
  Tooltip,
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  Legend
);

// Global Chart.js defaults to prevent jittering
Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;
Chart.defaults.font.size = 12;

// Tooltip defaults for stable interactions
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.displayColors = false;
Chart.defaults.plugins.tooltip.mode = "nearest";
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.position = "nearest";
Chart.defaults.plugins.tooltip.caretSize = 0;
Chart.defaults.plugins.tooltip.caretPadding = 20;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 8;

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
