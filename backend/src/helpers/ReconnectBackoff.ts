const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60000;
const JITTER_RATIO = 0.3;

export const MAX_RECONNECT_ATTEMPTS = 10;

export function calculateReconnectDelay(
  attempt: number,
  random: () => number = Math.random
): number {
  const safeAttempt = Math.max(attempt, 0);
  const exponential = Math.min(BASE_DELAY_MS * 2 ** safeAttempt, MAX_DELAY_MS);
  const jitter = exponential * JITTER_RATIO * random();
  return Math.round(exponential + jitter);
}

export function hasExceededReconnectAttempts(attempt: number): boolean {
  return attempt >= MAX_RECONNECT_ATTEMPTS;
}
