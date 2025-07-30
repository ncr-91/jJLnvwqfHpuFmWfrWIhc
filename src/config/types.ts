export type CardType =
  | "stat"
  | "chart"
  | "table"
  | "creative"
  | "widget"
  | "widgetMap"
  | "map"
  | "heatmap";

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
  pieChartCutout?: number;
  pieChartType?: "pie" | "donut";
  showWidgetSubtitle?: boolean;
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
    | "pieChart"
    | "heatmap";

  xAxisType?: "category" | "time";
  view?: "daily" | "weekly" | "monthly";
  thumbnailUrls?: string[];
  mediaUrls?: string[];
}

export const cardSizeClasses = {
  xxs: "col-span-full sm:col-span-4 md:col-span-4 xl:col-span-1",
  xs: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-2",
  ssm: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-3",
  sm: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-4",
  md: "col-span-full sm:col-span-12 md:col-span-6 xl:col-span-6",
  lg: "col-span-full sm:col-span-12 md:col-span-12 xl:col-span-8",
  xl: "col-span-full sm:col-span-12 md:col-span-12 xl:col-span-9",
  xxl: "col-span-full sm:col-span-12 md:col-span-12 xl:col-span-12",
} as const;
