export interface CampaignFailureStats {
  consecutiveFailures: number;
  totalAttempts: number;
  totalFailures: number;
}

export function createEmptyCampaignStats(): CampaignFailureStats {
  return { consecutiveFailures: 0, totalAttempts: 0, totalFailures: 0 };
}

export function recordAttempt(
  stats: CampaignFailureStats,
  succeeded: boolean
): CampaignFailureStats {
  return {
    consecutiveFailures: succeeded ? 0 : stats.consecutiveFailures + 1,
    totalAttempts: stats.totalAttempts + 1,
    totalFailures: stats.totalFailures + (succeeded ? 0 : 1)
  };
}

export interface CircuitBreakerOptions {
  maxConsecutiveFailures?: number;
  minAttemptsBeforeRateCheck?: number;
  maxFailureRate?: number;
}

const DEFAULT_MAX_CONSECUTIVE_FAILURES = 5;
const DEFAULT_MIN_ATTEMPTS_BEFORE_RATE_CHECK = 10;
const DEFAULT_MAX_FAILURE_RATE = 0.5;

/**
 * Decides whether a campaign should be auto-paused: either too many sends
 * failed back-to-back, or the overall failure rate is too high once there
 * have been enough attempts to be meaningful. Catching this early avoids
 * hammering WhatsApp with a broken/blocked number for the rest of the list.
 */
export function shouldCircuitBreak(
  stats: CampaignFailureStats,
  options: CircuitBreakerOptions = {}
): boolean {
  const {
    maxConsecutiveFailures = DEFAULT_MAX_CONSECUTIVE_FAILURES,
    minAttemptsBeforeRateCheck = DEFAULT_MIN_ATTEMPTS_BEFORE_RATE_CHECK,
    maxFailureRate = DEFAULT_MAX_FAILURE_RATE
  } = options;

  if (stats.consecutiveFailures >= maxConsecutiveFailures) return true;

  if (
    stats.totalAttempts >= minAttemptsBeforeRateCheck &&
    stats.totalFailures / stats.totalAttempts > maxFailureRate
  ) {
    return true;
  }

  return false;
}
