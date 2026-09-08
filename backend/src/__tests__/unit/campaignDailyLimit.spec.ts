import {
  getDayOffsetForContact,
  secondsUntilNextMidnight
} from "../../helpers/CampaignDailyLimit";

describe("CampaignDailyLimit Helper", () => {
  describe("getDayOffsetForContact", () => {
    it("returns 0 for every contact when the cap is disabled", () => {
      expect(getDayOffsetForContact(0, 0, 0)).toBe(0);
      expect(getDayOffsetForContact(500, 999, -1)).toBe(0);
    });

    it("keeps contacts in today's bucket while under the cap", () => {
      expect(getDayOffsetForContact(0, 95, 100)).toBe(0);
      expect(getDayOffsetForContact(4, 95, 100)).toBe(0);
    });

    it("pushes contacts into tomorrow once the cap is reached", () => {
      expect(getDayOffsetForContact(5, 95, 100)).toBe(1);
      expect(getDayOffsetForContact(104, 95, 100)).toBe(1);
      expect(getDayOffsetForContact(105, 95, 100)).toBe(2);
    });

    it("spreads a very large list across multiple future days", () => {
      expect(getDayOffsetForContact(250, 0, 100)).toBe(2);
      expect(getDayOffsetForContact(999, 0, 100)).toBe(9);
    });
  });

  describe("secondsUntilNextMidnight", () => {
    it("returns the exact remaining seconds before midnight", () => {
      const oneMinuteToMidnight = new Date(2026, 8, 2, 23, 59, 0);
      expect(secondsUntilNextMidnight(oneMinuteToMidnight)).toBe(60);
    });

    it("returns a full day when called exactly at midnight", () => {
      const midnight = new Date(2026, 8, 2, 0, 0, 0);
      expect(secondsUntilNextMidnight(midnight)).toBe(24 * 3600);
    });

    it("never returns a negative value", () => {
      const justBeforeMidnight = new Date(2026, 8, 2, 23, 59, 59);
      expect(secondsUntilNextMidnight(justBeforeMidnight)).toBeGreaterThanOrEqual(0);
    });
  });
});
