import {
  DEFAULT_WARMUP_STAGES,
  getConnectionAgeDays,
  getEffectiveDailyLimit,
  getWarmupCapForAge
} from "../../helpers/CampaignWarmup";

describe("CampaignWarmup Helper", () => {
  describe("getConnectionAgeDays", () => {
    it("returns 0 for a connection created right now", () => {
      const now = new Date(2026, 8, 2, 12, 0, 0);
      expect(getConnectionAgeDays(now, now)).toBe(0);
    });

    it("returns the number of days elapsed since creation", () => {
      const createdAt = new Date(2026, 8, 1, 12, 0, 0);
      const now = new Date(2026, 8, 8, 12, 0, 0);
      expect(getConnectionAgeDays(createdAt, now)).toBe(7);
    });

    it("never returns a negative age", () => {
      const createdAt = new Date(2026, 8, 10);
      const now = new Date(2026, 8, 1);
      expect(getConnectionAgeDays(createdAt, now)).toBe(0);
    });
  });

  describe("getWarmupCapForAge", () => {
    it("applies the first stage to a brand-new connection", () => {
      expect(getWarmupCapForAge(0)).toBe(40);
      expect(getWarmupCapForAge(0.9)).toBe(40);
    });

    it("moves through the stages as the connection ages", () => {
      expect(getWarmupCapForAge(1)).toBe(80);
      expect(getWarmupCapForAge(2.9)).toBe(80);
      expect(getWarmupCapForAge(3)).toBe(150);
      expect(getWarmupCapForAge(7)).toBe(300);
      expect(getWarmupCapForAge(14)).toBe(600);
    });

    it("lifts the restriction once the connection outgrows every stage", () => {
      expect(getWarmupCapForAge(21)).toBe(0);
      expect(getWarmupCapForAge(365)).toBe(0);
    });

    it("supports custom stage curves", () => {
      const stages = [{ maxAgeDays: 2, maxMessagesPerDay: 10 }];
      expect(getWarmupCapForAge(1, stages)).toBe(10);
      expect(getWarmupCapForAge(2, stages)).toBe(0);
    });
  });

  describe("getEffectiveDailyLimit", () => {
    it("uses the warm-up cap when the admin set no limit of their own", () => {
      expect(getEffectiveDailyLimit(0, 0)).toBe(40);
    });

    it("uses the stricter of warm-up cap and admin cap while warming up", () => {
      expect(getEffectiveDailyLimit(0, 1000)).toBe(40); // warm-up is stricter
      expect(getEffectiveDailyLimit(0, 10)).toBe(10); // admin is stricter
    });

    it("falls back to the admin's configured cap once fully warmed up", () => {
      expect(getEffectiveDailyLimit(365, 500)).toBe(500);
      expect(getEffectiveDailyLimit(365, 0)).toBe(0); // unlimited
    });

    it("uses the default stage table by default", () => {
      expect(getEffectiveDailyLimit(10, 0)).toBe(
        getWarmupCapForAge(10, DEFAULT_WARMUP_STAGES)
      );
    });
  });
});
