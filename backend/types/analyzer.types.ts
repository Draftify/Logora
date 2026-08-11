export interface AnalyzeOptions {
  model?: string;
  temperature?: number;
  focus?: string;
  context?: string;
  maxItems?: number;
}

export interface EventStats {
  total: number;
  services: Record<string, number>;
  events: Record<string, number>;
  users: Record<string, number>;
  securityRelated: number;
}

export const DEFAULT_MAX_ITEMS = 200;
