const MIN_TYPING_DELAY_MS = 700;
const MAX_TYPING_DELAY_MS = 3500;
const MS_PER_CHARACTER = 25;
const JITTER_RATIO = 0.2;

export function calculateTypingDelayMs(
  textLength: number,
  random: () => number = Math.random
): number {
  const base = Math.min(
    MIN_TYPING_DELAY_MS + Math.max(textLength, 0) * MS_PER_CHARACTER,
    MAX_TYPING_DELAY_MS
  );
  const jitter = base * JITTER_RATIO * (random() * 2 - 1);
  return Math.round(base + jitter);
}

const defaultWait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps wbot.sendMessage with a simulated "composing..." presence update,
 * so fully automated bot replies (greetings, menus, out-of-hours) don't fire
 * as cold, instant messages — one of the behavioral signals WhatsApp uses to
 * flag non-official clients.
 */
export async function sendBotMessage(
  wbot: any,
  jid: string,
  content: any,
  wait: (ms: number) => Promise<void> = defaultWait
): Promise<any> {
  const text = typeof content?.text === "string" ? content.text : "";

  try {
    await wbot.sendPresenceUpdate("composing", jid);
    await wait(calculateTypingDelayMs(text.length));
    await wbot.sendPresenceUpdate("paused", jid);
  } catch (error) {
    // Presence simulation is best-effort and must never block the actual message.
  }

  return wbot.sendMessage(jid, content);
}
