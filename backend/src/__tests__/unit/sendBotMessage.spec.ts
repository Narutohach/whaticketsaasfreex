import { calculateTypingDelayMs, sendBotMessage } from "../../helpers/SendBotMessage";

describe("SendBotMessage Helper", () => {
  describe("calculateTypingDelayMs", () => {
    it("returns the minimum delay for empty text", () => {
      expect(calculateTypingDelayMs(0, () => 0.5)).toBe(700);
    });

    it("grows with text length up to the cap", () => {
      const noJitter = () => 0.5;
      expect(calculateTypingDelayMs(10, noJitter)).toBe(950);
      expect(calculateTypingDelayMs(1000, noJitter)).toBe(3500);
    });

    it("applies jitter around the base delay", () => {
      const lower = calculateTypingDelayMs(10, () => 0);
      const upper = calculateTypingDelayMs(10, () => 1);
      expect(lower).toBeLessThan(950);
      expect(upper).toBeGreaterThan(950);
    });
  });

  describe("sendBotMessage", () => {
    it("simulates composing before sending and pauses after", async () => {
      const calls: string[] = [];
      const wbot = {
        sendPresenceUpdate: jest.fn(async (state: string) => {
          calls.push(state);
        }),
        sendMessage: jest.fn(async () => {
          calls.push("sendMessage");
          return { key: { id: "123" } };
        })
      };
      const wait = jest.fn(async () => {
        calls.push("wait");
      });

      const result = await sendBotMessage(
        wbot,
        "5511999999999@s.whatsapp.net",
        { text: "Olá!" },
        wait
      );

      expect(calls).toEqual(["composing", "wait", "paused", "sendMessage"]);
      expect(wbot.sendPresenceUpdate).toHaveBeenNthCalledWith(
        1,
        "composing",
        "5511999999999@s.whatsapp.net"
      );
      expect(wbot.sendPresenceUpdate).toHaveBeenNthCalledWith(
        2,
        "paused",
        "5511999999999@s.whatsapp.net"
      );
      expect(wbot.sendMessage).toHaveBeenCalledWith(
        "5511999999999@s.whatsapp.net",
        { text: "Olá!" }
      );
      expect(result).toEqual({ key: { id: "123" } });
    });

    it("still sends the message when presence simulation fails", async () => {
      const wbot = {
        sendPresenceUpdate: jest.fn(async () => {
          throw new Error("presence not supported");
        }),
        sendMessage: jest.fn(async () => ({ key: { id: "456" } }))
      };

      const result = await sendBotMessage(
        wbot,
        "5511999999999@s.whatsapp.net",
        { text: "Oi" },
        async () => {}
      );

      expect(wbot.sendMessage).toHaveBeenCalledWith(
        "5511999999999@s.whatsapp.net",
        { text: "Oi" }
      );
      expect(result).toEqual({ key: { id: "456" } });
    });

    it("handles non-text content without throwing", async () => {
      const wbot = {
        sendPresenceUpdate: jest.fn(async () => {}),
        sendMessage: jest.fn(async () => ({ key: { id: "789" } }))
      };
      const wait = jest.fn(async (_ms: number) => {});

      await sendBotMessage(wbot, "jid@s.whatsapp.net", { image: {} }, wait);

      expect(wait).toHaveBeenCalledTimes(1);
      const [delay] = wait.mock.calls[0];
      expect(delay).toBeGreaterThanOrEqual(700 * 0.8);
      expect(delay).toBeLessThanOrEqual(700 * 1.2);
    });
  });
});
