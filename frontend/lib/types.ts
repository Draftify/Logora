export interface AuthUser {
  id: string;
  email: string;
  createdAt?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  createdAt: string;
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface Risk {
  severity: RiskSeverity;
  description: string;
  affectedItems?: string[];
}

export interface Analysis {
  summary: string;
  insights: string[];
  risks: Risk[];
  recommendations: string[];
}

export interface StoredAnalysis extends Analysis {
  id: string;
  eventCount: number;
  createdAt: string;
  read: boolean;
}

export interface QueueStats {
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
}

export interface EventPayload {
  service: string;
  event: string;
  data: Record<string, unknown>;
}

export interface ServerHealth {
  status: "healthy" | "unhealthy";
  redis: string;
  uptimeSeconds?: number;
  memory?: {
    rssMb: number;
    heapUsedMb: number;
  };
}
