import type { Plugin } from "chart.js";

export interface ChartLegendPluginOptions {
  chartType: "bar" | "line" | "pie" | "heatmap";
  onVisibilityChange?: (index: number, isVisible: boolean) => void;
  legendItems?: Array<{ color: string; label: string }>;
}

export const createChartLegendPlugin = (
  legendRef: React.RefObject<HTMLUListElement | null>,
  options: ChartLegendPluginOptions
): Plugin => {
  const { chartType, onVisibilityChange } = options;

  const createLegendItem = (chart: any, dataset: any, index: number) => {
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

    const isVisible =
      chartType === "pie"
        ? (chart as any)._sliceVisibility?.[index] ?? true
        : chart.isDatasetVisible(index);
    button.style.opacity = isVisible ? "1" : ".3";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.paddingTop = "2px";
    button.style.paddingBottom = "2px";
    button.style.paddingLeft = "6px";
    button.style.paddingRight = "6px";
    button.style.marginRight = "4px";
    button.style.transition = "background 0.2s, color 0.2s";
    button.style.background = isVisible ? "white" : "var(--color-teal-50)";

    // Hover events
    button.onmouseenter = () => {
      button.style.background = "var(--color-teal-50)";
      button.style.color = "var(--color-teal-800)";
    };

    button.onmouseleave = () => {
      button.style.background = isVisible ? "white" : "var(--color-teal-50)";
      button.style.color = isVisible
        ? "var(--color-gray-500)"
        : "var(--color-gray-400)";
    };

    // Click handler
    button.onclick = () => {
      const newVisibility = !isVisible;

      if (chartType === "pie") {
        // Special handling for pie charts
        const chartInstance = chart as any;
        if (!chartInstance._sliceVisibility) {
          chartInstance._sliceVisibility = new Array(
            chart.data.labels?.length || 0
          ).fill(true);
        }
        chartInstance._sliceVisibility[index] = newVisibility;

        // Update the data to hide/show the slice
        const originalData =
          chartInstance._originalData || chart.data.datasets[0].data;
        if (!chartInstance._originalData) {
          chartInstance._originalData = [...originalData];
        }

        const newData = chartInstance._originalData.map(
          (value: any, i: number) =>
            chartInstance._sliceVisibility[i] ? value : 0
        );

        chart.data.datasets[0].data = newData;
      } else {
        // Standard dataset visibility for bar/line charts
        chart.setDatasetVisibility(index, newVisibility);
      }

      // For line charts, simulate the initial render animation
      if (chartType === "line") {
        const originalAnimation = chart.options.animation;
        chart.options.animation = { duration: 400 };

        // Temporarily set data to zero to simulate "build from bottom" effect
        const originalData = chart.data.datasets[index].data;
        chart.data.datasets[index].data = originalData.map(() => 0);
        chart.update("none");

        // Animate to actual values
        chart.data.datasets[index].data = originalData;
        chart.update();

        chart.options.animation = originalAnimation;
      } else {
        chart.update();
      }
      onVisibilityChange?.(index, newVisibility);
    };

    // Create color box
    const box = document.createElement("span");
    box.style.display = "block";
    box.style.width = chartType === "pie" ? "10px" : "12px";
    box.style.height = chartType === "pie" ? "10px" : "12px";
    box.style.borderRadius = "50%";
    box.style.marginRight = chartType === "pie" ? "6px" : "8px";
    box.style.borderWidth = "3px";
    box.style.borderStyle = "solid";
    box.style.flexShrink = "0";

    let color = "#000";
    if (chartType === "line") {
      // For line charts, prioritize borderColor over backgroundColor
      if (Array.isArray(dataset.borderColor)) {
        color = dataset.borderColor[0] as string;
      } else if (dataset.borderColor) {
        color = dataset.borderColor as string;
      } else if (Array.isArray(dataset.backgroundColor)) {
        color = dataset.backgroundColor[0] as string;
      } else if (dataset.backgroundColor) {
        color = dataset.backgroundColor as string;
      }
    } else if (chartType === "pie") {
      // For pie charts, use index-based colors
      if (Array.isArray(dataset.backgroundColor)) {
        color = dataset.backgroundColor[index] as string;
      } else if (dataset.backgroundColor) {
        color = dataset.backgroundColor as string;
      } else if (Array.isArray(dataset.borderColor)) {
        color = dataset.borderColor[index] as string;
      } else if (dataset.borderColor) {
        color = dataset.borderColor as string;
      }
    } else {
      // For bar charts, use first color from arrays
      if (Array.isArray(dataset.backgroundColor)) {
        color = dataset.backgroundColor[0] as string;
      } else if (dataset.backgroundColor) {
        color = dataset.backgroundColor as string;
      } else if (Array.isArray(dataset.borderColor)) {
        color = dataset.borderColor[0] as string;
      } else if (dataset.borderColor) {
        color = dataset.borderColor as string;
      }
    }

    box.style.borderColor = color;
    box.style.backgroundColor = "transparent";
    box.style.pointerEvents = "none";

    // Create label
    const labelSpan = document.createElement("span");
    labelSpan.style.pointerEvents = "none";

    if (chartType === "pie") {
      const label = chart.data.labels?.[index];
      labelSpan.textContent = String(label || `Slice ${index + 1}`);
    } else {
      labelSpan.textContent = dataset.label || `Dataset ${index + 1}`;
    }

    // Assemble the legend item
    li.appendChild(button);
    button.appendChild(box);
    button.appendChild(labelSpan);

    return li;
  };

  return {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;

      // Clear existing legend
      while (ul.firstChild) {
        ul.firstChild.remove();
      }

      if (chartType === "heatmap") {
        // Heatmap legend - static items
        const items = options.legendItems || [
          { color: "#f0fdfc", label: "None" },
          { color: "#ccfbf1", label: "Low" },
          { color: "#00a89e", label: "Medium" },
          { color: "#134e4a", label: "High" },
        ];

        items.forEach((item) => {
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

          button.style.display = "flex";
          button.style.alignItems = "center";
          button.style.paddingTop = "2px";
          button.style.paddingBottom = "2px";
          button.style.paddingLeft = "6px";
          button.style.paddingRight = "6px";
          button.style.marginRight = "4px";
          button.style.transition = "background 0.2s, color 0.2s";

          // Hover events
          button.onmouseenter = () => {
            button.style.background = "var(--color-teal-50)";
            button.style.color = "var(--color-teal-800)";
          };

          button.onmouseleave = () => {
            button.style.background = "white";
            button.style.color = "var(--color-gray-500)";
          };

          // Create color box
          const box = document.createElement("span");
          box.style.display = "block";
          box.style.width = "12px";
          box.style.height = "12px";
          box.style.borderRadius = "50%";
          box.style.marginRight = "8px";
          box.style.borderWidth = "3px";
          box.style.borderStyle = "solid";
          box.style.borderColor = item.color;
          box.style.backgroundColor = "transparent";
          box.style.flexShrink = "0";
          box.style.pointerEvents = "none";

          // Create label
          const labelSpan = document.createElement("span");
          labelSpan.style.pointerEvents = "none";
          labelSpan.textContent = item.label;

          // Assemble the legend item
          li.appendChild(button);
          button.appendChild(box);
          button.appendChild(labelSpan);
          ul.appendChild(li);
        });
      } else if (chartType === "pie") {
        // Pie chart legend
        const labels = chart.data.labels || [];
        const dataset = chart.data.datasets[0];
        labels.forEach((_label, index) => {
          const li = createLegendItem(chart, dataset, index);
          ul.appendChild(li);
        });
      } else {
        // Bar/Line chart legend
        chart.data.datasets.forEach((dataset, index) => {
          const li = createLegendItem(chart, dataset, index);
          ul.appendChild(li);
        });
      }
    },
  };
};
