// Import all configuration files
import type { CardConfig } from "./types";
import { widgetConfigs } from "./widgetConfig";
import { statConfigs } from "./statConfig";
import { chartConfigs } from "./chartConfig";
import { tableConfigs } from "./tableConfig";

// Re-export types and constants
export type { CardConfig, CardType } from "./types";
export { cardSizeClasses } from "./types";
export { widgetConfigs } from "./widgetConfig";
export { statConfigs } from "./statConfig";
export { chartConfigs } from "./chartConfig";
export { tableConfigs } from "./tableConfig";

// Combine all configurations
export const cardConfigs: CardConfig[] = [
  ...widgetConfigs,
  ...statConfigs,
  ...chartConfigs,
  ...tableConfigs,
];
