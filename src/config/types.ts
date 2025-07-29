export type CardType =
  | "stat"
  | "chart"
  | "table"
  | "creative"
  | "widget"
  | "widgetMap"
  | "map";

export interface CardConfig {
  id: string;
  type: CardType;
  size?: keyof typeof cardSizeClasses;
  rowSpan?: number;
  csvUrl?: string;
  chartType?: string;
  colors?: string[];
  showCardHeader: boolean;
  showCardHeaderBorder: boolean;
  showCardActionButton: boolean;
  showDropdownMenu: boolean;
  showTotal: boolean;
  showTrend: boolean;
  BarChartDirection?: "vertical" | "horizontal";
  BarChartPercent?: boolean;
  BarChartStacked?: boolean;
  showChartLegend?: boolean;
  legendPosition?: "bottom" | "right";
  showChartGridlineX?: boolean;
  showChartGridlineY?: boolean;
  showLineChartGradient?: boolean;
  showChartLabelsX?: boolean;
  showChartLabelsY?: boolean;
  pieChartCutout?: number; // For pie chart donut effect (0-100)
  pieChartType?: "pie" | "donut"; // Toggle between pie and donut chart
  showWidgetSubtitle?: boolean; // default false
  parserType?:
    | "shareChart"
    | "shareChartExtended"
    | "dailyTimeSeries"
    | "monthlyTimeSeriesHardCoded"
    | "monthlyTimeSeries"
    | "table"
    | "widgetChart"
    | "barChart"
    | "widgetMap"
    | "map"
    | "pieChart";

  xAxisType?: "category" | "time";
  view?: "daily" | "weekly" | "monthly";
}

export const cardSizeClasses = {
  xs: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-2",
  sm: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-4",
  md: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-6",
  lg: "col-span-full sm:col-span-12 md:col-span-12 xl:col-span-8",
  xl: "col-span-full sm:col-span-12 md:col-span-12 xl:col-span-12",
} as const;
