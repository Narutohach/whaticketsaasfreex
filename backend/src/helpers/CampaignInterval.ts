export function getBaseIntervalSeconds(
  index: number,
  longerIntervalAfter: number,
  messageInterval: number,
  greaterInterval: number
): number {
  if (longerIntervalAfter > 0 && index >= longerIntervalAfter) {
    return greaterInterval;
  }
  return messageInterval;
}

export function applyJitter(
  seconds: number,
  jitterRatio = 0.3,
  random: () => number = Math.random
): number {
  if (seconds <= 0) return seconds;
  const jitter = seconds * jitterRatio;
  const offset = (random() * 2 - 1) * jitter;
  return Math.max(1, Math.round(seconds + offset));
}
