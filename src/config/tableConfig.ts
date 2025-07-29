import type { CardConfig } from "../config/types";

export const tableConfigs: CardConfig[] = [
  {
    id: "table01",
    type: "table",
    size: "xl",
    rowSpan: 2,
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLjue9MJvewUb1ZK7TZ4XgVjM0vRsfb07tPzDTbkGWNzfWAtLfY-NsRHZv5W-HM9W87vorat1fGnz8/pub?gid=1082926189&single=true&output=csv",
    chartType: "table",
    showCardHeader: true,
    showCardHeaderBorder: true,
    showCardActionButton: false,
    showDropdownMenu: false,
    showTotal: false,
    showTrend: false,
    parserType: "table",
  },
  {
    id: "creativesCard",
    type: "creative",
    size: "xl",
    rowSpan: 2,
    showCardHeader: true,
    showCardHeaderBorder: true,
    showCardActionButton: true,
    showDropdownMenu: false,
    showTotal: false,
    showTrend: false,
    parserType: undefined,
  },
];
