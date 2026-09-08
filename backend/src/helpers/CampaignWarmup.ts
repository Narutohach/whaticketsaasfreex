export interface WarmupStage {
  /** This stage applies while the connection is younger than this many days. */
  maxAgeDays: number;
  maxMessagesPerDay: number;
}

/**
 * Heuristic ramp-up curve for freshly connected numbers. There's no official
 * WhatsApp guidance on safe volumes for unofficial clients — these values are
 * a conservative, commonly cited rule of thumb, not a guarantee. Companies
 * migrating an already-established number can turn this off entirely via the
 * "warmupEnabled" campaign setting instead of fighting these numbers.
 */
export const DEFAULT_WARMUP_STAGES: WarmupStage[] = [
  { maxAgeDays: 1, maxMessagesPerDay: 40 },
  { maxAgeDays: 3, maxMessagesPerDay: 80 },
  { maxAgeDays: 7, maxMessagesPerDay: 150 },
  { maxAgeDays: 14, maxMessagesPerDay: 300 },
  { maxAgeDays: 21, maxMessagesPerDay: 600 }
];

export function getConnectionAgeDays(createdAt: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - new Date(createdAt).getTime();
  return Math.max(diffMs / (24 * 60 * 60 * 1000), 0);
}

/**
 * Returns the warm-up cap for a connection of the given age, or 0 once the
 * connection has outgrown every stage (i.e. no warm-up restriction applies).
 */
export function getWarmupCapForAge(
  connectionAgeDays: number,
  stages: WarmupStage[] = DEFAULT_WARMUP_STAGES
): number {
  const stage = stages.find(s => connectionAgeDays < s.maxAgeDays);
  return stage ? stage.maxMessagesPerDay : 0;
}

/**
 * Combines the admin-configured daily cap with the warm-up cap for the
 * connection's current age: whichever is more restrictive wins, and 0 (no
 * limit) only when neither applies.
 */
export function getEffectiveDailyLimit(
  connectionAgeDays: number,
  configuredMaxPerDay: number,
  stages: WarmupStage[] = DEFAULT_WARMUP_STAGES
): number {
  const warmupCap = getWarmupCapForAge(connectionAgeDays, stages);

  if (warmupCap <= 0) {
    return configuredMaxPerDay;
  }
  if (configuredMaxPerDay <= 0) {
    return warmupCap;
  }
  return Math.min(warmupCap, configuredMaxPerDay);
}
