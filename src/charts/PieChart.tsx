import { useRef, useEffect, useState } from "react";
import { chartColors } from "../utils/ChartjsConfig";
import {
  Chart,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type TooltipItem,
} from "chart.js";
import { formatValue } from "../utils/utils";
import { createChartLegendPlugin } from "../components/CardElements/ChartLegend";
import {
  createPieChartTooltipCallbacks,
  getChartTooltipColors,
} from "../components/CardElements/ChartTooltip";

interface PieChartProps {
  id?: string;
  data: ChartData<"pie">;
  percent?: boolean;
  showChartLegend?: boolean;
  legendPosition?: "bottom" | "right";
  showChartLabelsX?: boolean;
  showChartLabelsY?: boolean;
  showChartGridlineX?: boolean;
  showChartGridlineY?: boolean;
  cutout?: number;
  stacked?: boolean; // Added for compatibility but ignored in pie charts
}

function PieChart({
  data,
  percent = false,
  showChartLegend = false,
  legendPosition = "bottom",

  cutout = 0,
}: PieChartProps) {
  const [chart, setChart] = useState<Chart<"pie"> | null>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const legend = useRef<HTMLUListElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;

    let chartInstance: Chart<"pie"> | null = null;

    const htmlLegendPlugin = createChartLegendPlugin(legend, {
      chartType: "pie",
    });

    const tooltipCallbacks = createPieChartTooltipCallbacks({
      percent,
    });

    const chartOptions: ChartOptions<"pie"> = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200,
      interaction: { mode: "nearest", intersect: true },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: tooltipCallbacks,
          displayColors: true,
          ...getChartTooltipColors(chartColors),
        },
      },
      animation: {
        duration: 500,
      },
      cutout: cutout > 0 ? `${cutout}%` : undefined,
    };

    chartInstance = new Chart<"pie">(ctx, {
      type: "pie",
      data: data,
      options: chartOptions,
      plugins: [htmlLegendPlugin],
    });

    setChart(chartInstance);
    return () => {
      if (chartInstance) {
        try {
          chartInstance.destroy();
        } catch (error) {
          console.warn("Chart destroy error:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!chart) return;

    chart.data = data;

    if (isInitialRender) {
      chart.update();
      setIsInitialRender(false);
    } else {
      chart.update("none");
    }
  }, [chart, data, isInitialRender]);

  useEffect(() => {
    if (!chart) return;

    const tooltipColors = getChartTooltipColors(chartColors);
    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.bodyColor = tooltipColors.bodyColor;
      chart.options.plugins.tooltip.backgroundColor =
        tooltipColors.backgroundColor;
      chart.options.plugins.tooltip.borderColor = tooltipColors.borderColor;
    }
    chart.update("none");
  }, [chart, chartColors]);

  useEffect(() => {
    if (chart && canvas.current && canvas.current.ownerDocument) {
      const resizeObserver = new ResizeObserver(() => {
        if (
          !isMounted.current ||
          !canvas.current ||
          !canvas.current.ownerDocument
        ) {
          return;
        }

        if (chart && canvas.current && canvas.current.ownerDocument) {
          try {
            chart.resize();
            chart.update();
          } catch (error) {
            console.warn("Chart resize error:", error);
          }
        }
      });

      resizeObserver.observe(canvas.current);

      return () => {
        try {
          resizeObserver.disconnect();
        } catch (error) {
          console.warn("ResizeObserver disconnect error:", error);
        }
      };
    }
  }, [chart]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (chart) {
        try {
          chart.destroy();
        } catch (error) {
          console.warn("Chart cleanup error:", error);
        }
      }
    };
  }, [chart]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (chart) {
        try {
          chart.destroy();
        } catch (error) {
          console.warn("Chart unmount cleanup error:", error);
        }
      }
    };
  }, [chart]);

  return (
    <div
      className={`h-full w-full overflow-hidden ${
        legendPosition === "right"
          ? "flex flex-col sm:flex-row"
          : "flex flex-col"
      }`}
    >
      <div
        className={`flex-1 min-h-0 max-w-full px-4 py-2 sm:px-4 sm:py-2 ${
          showChartLegend && legendPosition === "bottom" ? "" : "mb-0"
        }`}
      >
        <canvas
          ref={canvas}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>
      {showChartLegend && (
        <div
          className={`flex-shrink-0 ${
            legendPosition === "bottom"
              ? "px-5 pt-2 pb-6"
              : "px-0 py-2 sm:px-0 sm:py-2 sm:w-20 sm:order-last sm:flex sm:items-center"
          }`}
        >
          <ul
            ref={legend}
            className={`${
              legendPosition === "bottom"
                ? "flex flex-wrap justify-center -m-1"
                : "flex flex-wrap justify-center -m-1 sm:flex-col sm:space-y-1 sm:text-xs"
            }`}
          ></ul>
        </div>
      )}
    </div>
  );
}

export default PieChart;
