import React, { useRef, useEffect } from "react";
import { chartColors } from "../utils/ChartjsConfig.tsx";
import {
  Chart,
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  CategoryScale,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
  type Plugin,
} from "chart.js";
import "chartjs-adapter-moment";
import { formatValue } from "../utils/utils";
import { parseISO, format, getISOWeek } from "date-fns";

Chart.register(
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  CategoryScale
);

interface LineChartProps {
  data: ChartData<"line">;
  width?: number;
  height?: number;
  showChartLegend?: boolean;
  legendPosition?: "bottom" | "right";
  showChartGridlineX?: boolean;
  showChartGridlineY?: boolean;
  showLineChartGradient?: boolean;
  showChartLabelsX?: boolean;
  showChartLabelsY?: boolean;
  xAxisType?: "category" | "time";
  view?: "daily" | "weekly" | "monthly";
  tooltipMode?: "date" | "label";
}

function LineChart({
  data,
  showChartLegend = false,
  legendPosition = "bottom",
  showChartGridlineX = false,
  showChartGridlineY = false,
  showLineChartGradient = false,
  showChartLabelsX = true,
  showChartLabelsY = true,
  xAxisType = "category",
  view = "monthly",
  tooltipMode = "date",
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);
  const hasRendered = useRef(false);
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;
  const customLegendRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Custom HTML legend plugin (if showChartLegend is true)
    const htmlLegendPlugin: Plugin<"line"> = {
      id: "htmlLegend",
      afterUpdate(c) {
        const ul = customLegendRef.current;
        if (!ul) return;
        while (ul.firstChild) {
          ul.firstChild.remove();
        }
        c.data.datasets.forEach((dataset, index) => {
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
          const isVisible = c.isDatasetVisible(index);
          button.style.opacity = isVisible ? "1" : ".3";
          button.style.display = "flex";
          button.style.alignItems = "center";
          button.style.paddingTop = "2px";
          button.style.paddingBottom = "2px";
          button.style.paddingLeft = "6px";
          button.style.paddingRight = "6px";
          button.style.marginRight = "4px";
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
            c.setDatasetVisibility(index, !c.isDatasetVisible(index));
            c.update();
          };
          const box = document.createElement("span");
          box.style.display = "block";
          box.style.width = "12px";
          box.style.height = "12px";
          box.style.borderRadius = "50%";
          box.style.marginRight = "8px";
          box.style.borderWidth = "3px";
          box.style.borderStyle = "solid";
          box.style.flexShrink = "0";
          // Prioritize borderColor for line color
          let color = "#000";
          if (Array.isArray(dataset.borderColor)) {
            color = dataset.borderColor[0] as string;
          } else if (dataset.borderColor) {
            color = dataset.borderColor as string;
          } else if (Array.isArray(dataset.backgroundColor)) {
            color = dataset.backgroundColor[0] as string;
          } else if (dataset.backgroundColor) {
            color = dataset.backgroundColor as string;
          }
          box.style.borderColor = color;
          box.style.backgroundColor = "transparent";
          box.style.pointerEvents = "none";
          const labelSpan = document.createElement("span");
          labelSpan.style.pointerEvents = "none";
          const labelText = dataset.label || `Dataset ${index + 1}`;
          labelSpan.textContent = labelText;
          li.appendChild(button);
          button.appendChild(box);
          button.appendChild(labelSpan);
          ul.appendChild(li);
        });
      },
    };

    const plugins = [...(showChartLegend ? [htmlLegendPlugin] : [])];

    if (!chartRef.current) {
      chartRef.current = new Chart<"line">(ctx, {
        type: "line",
        data,
        options: {
          animation: {
            duration: 400,
          },
          layout: {
            padding: 20,
          },
          scales: {
            y: {
              display: showChartGridlineY,
              beginAtZero: true,
              min: 0,
              suggestedMax: 100,
              grid: {
                display: showChartGridlineY,
              },
              ticks: {
                maxTicksLimit: 6,
                callback: (value) => formatValue(Number(value)),
                display: showChartLabelsY,
              },
              border: { display: false },
            },
            x:
              xAxisType === "time"
                ? {
                    type: "time",
                    time: {
                      unit:
                        view === "monthly"
                          ? "month"
                          : view === "weekly"
                          ? "week"
                          : "day",
                      tooltipFormat:
                        view === "daily"
                          ? "dd,MM,yy"
                          : view === "weekly"
                          ? "MMM yy"
                          : "MMM yy",
                      displayFormats: {
                        day: "dd-MM-yy",
                        week: "'Week' II- yy",
                        month: "MMM yy",
                      },
                    },
                    display: true,
                    border: { display: false },
                    grid: { display: showChartGridlineX },
                    ticks: {
                      autoSkipPadding: 48,
                      maxRotation: 0,
                      display: showChartLabelsX,
                      callback: function (value: any) {
                        let date: Date | null = null;
                        if (typeof value === "string") {
                          date = parseISO(value);
                        } else if (typeof value === "number") {
                          date = new Date(value);
                        } else if (value instanceof Date) {
                          date = value;
                        }
                        if (!date || isNaN(date.getTime())) return value;
                        if (view === "daily") return format(date, "dd-MM-yy");
                        if (view === "weekly")
                          return `Week ${getISOWeek(date)}, ${format(
                            date,
                            "yyyy"
                          )}`;
                        if (view === "monthly") return format(date, "MMM yy");
                        return value;
                      },
                    },
                    stacked: false,
                  }
                : {
                    type: "category",
                    display: true,
                    grid: { display: showChartGridlineX },
                    ticks: {
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 6,
                      display: showChartLabelsX,
                    },
                    border: { display: false },
                  },
          },
          plugins: {
            tooltip: {
              enabled: true,
              bodyColor: tooltipBodyColor.light,
              backgroundColor: tooltipBgColor.light,
              borderColor: tooltipBorderColor.light,
              borderWidth: 1,
              mode: "index",
              intersect: false,
              callbacks: {
                title: () => "",
                beforeBody: (tooltipItems) => {
                  if (tooltipMode === "label") {
                    const item = tooltipItems[0];
                    const labels = item?.chart?.data?.labels;
                    if (labels && typeof item?.dataIndex === "number") {
                      return [String(labels[item.dataIndex])];
                    }
                    if (typeof item?.label === "string") return [item.label];
                    if (typeof item?.parsed?.x === "string")
                      return [item.parsed.x];
                    return [""];
                  } else {
                    let date = null;
                    const value = tooltipItems[0].parsed.x;
                    if (typeof value === "string") {
                      date = parseISO(value);
                    } else if (typeof value === "number") {
                      date = new Date(value);
                    }
                    if (!date || isNaN(date.getTime())) return [String(value)];
                    if (view === "weekly") {
                      return [
                        `Week ${getISOWeek(date)}, ${format(date, "yyyy")}`,
                      ];
                    }
                    if (view === "monthly") {
                      return [format(date, "MMM yyyy")];
                    }
                    return [format(date, "dd-MM-yyyy")];
                  }
                },
                label: (context) => {
                  const datasetLabel = context.dataset.label || "";
                  const value = formatValue(context.parsed.y);
                  return `${datasetLabel}: ${value}`;
                },
                afterBody: (tooltipItems) => {
                  const total = tooltipItems.reduce(
                    (sum, item) => sum + item.parsed.y,
                    0
                  );
                  return [`Total: ${formatValue(total)}`];
                },
              },
              displayColors: true,
              bodySpacing: 4,
            },
            legend: {
              display: false, // Always disable Chart.js legend for line charts
            },
          },
          interaction: {
            intersect: false,
            mode: "nearest",
          },
          maintainAspectRatio: false,
          resizeDelay: 200,
        } as ChartOptions<"line">,
        plugins,
      });
      hasRendered.current = true;
    } else {
      chartRef.current.data = data;
      if (!hasRendered.current) {
        chartRef.current.update("none");
        hasRendered.current = true;
      } else {
        chartRef.current.update();
      }
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [
    data,
    tooltipBodyColor,
    tooltipBgColor,
    tooltipBorderColor,
    showChartLegend,
    showChartGridlineX,
    showChartGridlineY,
    xAxisType,
    view,
    tooltipMode,
  ]);

  return (
    <div
      className={`h-full w-full overflow-hidden ${
        legendPosition === "right" ? "flex" : "flex flex-col"
      }`}
    >
      <div
        className={`flex-1 min-h-0 px-2 ${
          showChartLegend && legendPosition === "bottom" ? "" : "pb-2"
        }`}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {showChartLegend && (
        <div
          className={`flex-shrink-0 ${
            legendPosition === "bottom"
              ? "px-5 pt-2 pb-6"
              : "px-1 py-2 w-16 sm:w-20 md:w-24 lg:w-32"
          }`}
        >
          <ul
            ref={customLegendRef}
            className={`${
              legendPosition === "bottom"
                ? "flex flex-wrap justify-center -m-1"
                : "flex flex-col space-y-1 text-xs sm:text-sm"
            }`}
          ></ul>
        </div>
      )}
    </div>
  );
}

export default LineChart;
