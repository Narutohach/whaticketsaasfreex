/**
 * Determines which "day bucket" (0 = today, 1 = tomorrow, ...) a contact
 * falls into, given how many messages this WhatsApp number already sent
 * today and a per-day cap. maxPerDay <= 0 means the cap is disabled.
 */
export function getDayOffsetForContact(
  contactIndex: number,
  alreadySentToday: number,
  maxPerDay: number
): number {
  if (maxPerDay <= 0) return 0;
  const position = alreadySentToday + contactIndex;
  return Math.floor(position / maxPerDay);
}

export function secondsUntilNextMidnight(now: Date): number {
  const nextMidnight = new Date(now.getTime());
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(Math.round((nextMidnight.getTime() - now.getTime()) / 1000), 0);
}
