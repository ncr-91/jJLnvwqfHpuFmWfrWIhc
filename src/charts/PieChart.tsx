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
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;

    let chartInstance: Chart<"pie"> | null = null;

    const htmlLegendPlugin: Plugin<"pie"> = {
      id: "htmlLegend",
      afterUpdate(c) {
        const ul = legend.current;
        if (!ul) return;
        while (ul.firstChild) {
          ul.firstChild.remove();
        }
        // For pie charts, iterate over labels instead of datasets
        const labels = c.data.labels || [];
        const dataset = c.data.datasets[0]; // Pie charts have only one dataset

        labels.forEach((label, index) => {
          const li = document.createElement("li");
          li.style.margin = "4px";
          const button = document.createElement("button");
          button.classList.add(
            "btn-xs",
            "text-sm",
            "bg-white",
            "border",
            "rounded-md",
            "border-gray-100",
            "text-gray-500",
            "hover:text-gray-900",
            "rounded-full"
          );
          // Check if this specific slice is visible
          const chartInstance = c as any;
          const sliceVisibility =
            chartInstance._sliceVisibility ||
            new Array(labels.length).fill(true);
          const isVisible = sliceVisibility[index];
          button.style.opacity = isVisible ? "1" : ".3";
          button.style.display = "flex";
          button.style.alignItems = "center";
          button.style.paddingTop = "1px";
          button.style.paddingBottom = "1px";
          button.style.paddingLeft = "4px";
          button.style.paddingRight = "4px";
          button.style.marginRight = "3px";
          button.style.transition = "background 0.2s, color 0.2s";
          button.style.background = isVisible
            ? "white"
            : "var(--color-teal-50)";
          button.onmouseenter = () => {
            button.style.background = "var(--color-teal-100)";
            button.style.color = "var(--color-teal-700)";
          };
          button.onmouseleave = () => {
            button.style.background = isVisible
              ? "white"
              : "var(--color-teal-50)";
            button.style.color = isVisible
              ? "var(--color-gray-500)"
              : "var(--color-gray-400)";
          };
          button.onclick = () => {
            // For pie charts, we need to handle individual slice visibility
            // Store visibility state in the chart instance
            const chartInstance = c as any;
            if (!chartInstance._sliceVisibility) {
              chartInstance._sliceVisibility = new Array(labels.length).fill(
                true
              );
            }

            // Toggle the specific slice visibility
            chartInstance._sliceVisibility[index] =
              !chartInstance._sliceVisibility[index];

            // Update the data to hide/show the slice
            const originalData =
              chartInstance._originalData || c.data.datasets[0].data;
            if (!chartInstance._originalData) {
              chartInstance._originalData = [...originalData];
            }

            const newData = chartInstance._originalData.map(
              (value: any, i: number) =>
                chartInstance._sliceVisibility[i] ? value : 0
            );

            c.data.datasets[0].data = newData;
            c.update();
          };
          const box = document.createElement("span");
          box.style.display = "block";
          box.style.width = "10px";
          box.style.height = "10px";
          box.style.borderRadius = "50%";
          box.style.marginRight = "6px";
          box.style.borderWidth = "3px";
          box.style.borderStyle = "solid";
          box.style.flexShrink = "0";
          let color = "#000";
          if (Array.isArray(dataset.backgroundColor)) {
            color = dataset.backgroundColor[index] as string;
          } else if (dataset.backgroundColor) {
            color = dataset.backgroundColor as string;
          } else if (Array.isArray(dataset.borderColor)) {
            color = dataset.borderColor[index] as string;
          } else if (dataset.borderColor) {
            color = dataset.borderColor as string;
          }
          box.style.borderColor = color;
          box.style.backgroundColor = "transparent";
          box.style.pointerEvents = "none";
          const labelSpan = document.createElement("span");
          labelSpan.style.pointerEvents = "none";

          const labelText = String(label || `Slice ${index + 1}`);
          labelSpan.textContent = labelText;
          li.appendChild(button);
          button.appendChild(box);
          button.appendChild(labelSpan);
          ul.appendChild(li);
        });
      },
    };

    const tooltipCallbacks = {
      title: () => "",
      beforeBody: (tooltipItems: TooltipItem<"pie">[]) =>
        tooltipItems[0]?.label || "",
      label: (context: TooltipItem<"pie">) => {
        const rawValue = context.parsed;
        const total = (context.dataset.data as number[]).reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        const percentage =
          total > 0 ? ((rawValue / total) * 100).toFixed(1) : "0.0";
        const value = percent ? `${rawValue}%` : formatValue(rawValue);
        return `${value} (${percentage}%)`;
      },
    };

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
          bodySpacing: 4,
          bodyColor: tooltipBodyColor?.light || "#000",
          backgroundColor: tooltipBgColor?.light || "#fff",
          borderColor: tooltipBorderColor?.light || "#ccc",
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

  // ===== 3. chart.update() for Data Changes =====
  useEffect(() => {
    if (!chart) return;

    chart.data = data;

    if (isInitialRender) {
      // Use animation only for initial render
      chart.update();
      setIsInitialRender(false);
    } else {
      // Use no animation for subsequent updates to prevent jittering
      chart.update("none");
    }
  }, [chart, data, isInitialRender]);

  // ===== 3. chart.update('none') for Theme Changes =====
  useEffect(() => {
    if (!chart) return;

    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.bodyColor =
        tooltipBodyColor?.light || "#000";
      chart.options.plugins.tooltip.backgroundColor =
        tooltipBgColor?.light || "#fff";
      chart.options.plugins.tooltip.borderColor =
        tooltipBorderColor?.light || "#ccc";
    }
    chart.update("none"); // No animation to prevent jittering
  }, [chart, tooltipBodyColor, tooltipBgColor, tooltipBorderColor]);

  // Force chart resize when container size changes
  useEffect(() => {
    if (chart && canvas.current && canvas.current.ownerDocument) {
      const resizeObserver = new ResizeObserver(() => {
        // Check if component is still mounted and element exists
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

  // Cleanup chart on unmount
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

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Immediately destroy chart to prevent any further operations
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
