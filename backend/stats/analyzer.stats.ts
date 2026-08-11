import type { EventPayload } from "../schema/event.schema";
import type { EventStats } from "../types/analyzer.types";

const SECURITY_EVENT_PATTERN =
  /security|fraud|brute|abuse|lock|blocked|rate_limit|unauthorized|scan|escalation|chargeback|declined|refund|impossible/i;

export function summarizeEvents(events: EventPayload[]): EventStats {
  const stats: EventStats = {
    total: events.length,
    services: {},
    events: {},
    users: {},
    securityRelated: 0,
  };

  for (const event of events) {
    stats.services[event.service] = (stats.services[event.service] ?? 0) + 1;

    stats.events[event.event] = (stats.events[event.event] ?? 0) + 1;

    const userId = (event.data as { userId?: string } | undefined)?.userId;

    if (userId) {
      stats.users[userId] = (stats.users[userId] ?? 0) + 1;
    }

    if (SECURITY_EVENT_PATTERN.test(event.event)) {
      stats.securityRelated += 1;
    }
  }

  return stats;
}
