export type CardType =
  | "stat"
  | "dashboard"
  | "table"
  | "creative"
  | "widget"
  | "widgetMap";

export type ChartType = "line" | "bar" | "column" | "pie" | "doughnut";

export type ParserType =
  | "shareChart"
  | "dailyTimeSeries"
  | "monthlyTimeSeriesHardCoded"
  | "monthlyTimeSeries"
  | "table"
  | "widgetChart"
  | "map"
  | "barChart"
  | "shareChartExtended"
  | "pieChart"
  | "widgetMap";

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: (number | null)[] | Array<{ x: string; y: number | null }>;
    borderColor?: string | string[];
    backgroundColor?: string | string[] | ((context: any) => any);
    [key: string]: any;
  }>;
}

export type ParsedSheetData = {
  headerTitle: string;
  chartData: ChartData;
  subtitle?: string;
  currentMonthCount?: number | null;
  lastMonthCount?: number | null;
  total?: number | null;
};

export interface ParsedTableData {
  headerTitle: string;
  tableData: {
    columns: string[];
    rows: string[][];
  };
}

export interface CardConfig {
  id: string;
  type: CardType;
  gridClass: string;
  csvUrl?: string;
  chartType?: string;
  colors?: string[];
  showCardHeader: boolean;
  showCardHeaderBorder: boolean;
  showCardDateMenu: boolean;
  showDropdownMenu: boolean;
  showTotal: boolean;
  showTrend: boolean;
  useGradient: boolean;
}
