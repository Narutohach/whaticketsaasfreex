import {
  applyJitter,
  getBaseIntervalSeconds
} from "../../helpers/CampaignInterval";

describe("CampaignInterval Helper", () => {
  describe("getBaseIntervalSeconds", () => {
    it("uses the normal message interval before the longer-interval threshold", () => {
      expect(getBaseIntervalSeconds(0, 20, 20, 60)).toBe(20);
      expect(getBaseIntervalSeconds(19, 20, 20, 60)).toBe(20);
    });

    it("switches to the greater interval once the threshold is reached", () => {
      expect(getBaseIntervalSeconds(20, 20, 20, 60)).toBe(60);
      expect(getBaseIntervalSeconds(50, 20, 20, 60)).toBe(60);
    });

    it("ignores the threshold when longerIntervalAfter is not positive", () => {
      expect(getBaseIntervalSeconds(100, 0, 20, 60)).toBe(20);
      expect(getBaseIntervalSeconds(100, -1, 20, 60)).toBe(20);
    });
  });

  describe("applyJitter", () => {
    it("returns the exact value when jitter randomizer is neutral (midpoint)", () => {
      // random() = 0.5 -> offset = (0.5*2 - 1) * jitter = 0
      expect(applyJitter(20, 0.3, () => 0.5)).toBe(20);
    });

    it("varies the interval within the jitter ratio bounds", () => {
      const base = 20;
      const ratio = 0.3;
      const lower = applyJitter(base, ratio, () => 0);
      const upper = applyJitter(base, ratio, () => 1);

      expect(lower).toBe(Math.round(base - base * ratio));
      expect(upper).toBe(Math.round(base + base * ratio));
      expect(lower).toBeLessThan(base);
      expect(upper).toBeGreaterThan(base);
    });

    it("never returns a value below 1 second", () => {
      expect(applyJitter(1, 0.3, () => 0)).toBeGreaterThanOrEqual(1);
    });

    it("passes through non-positive intervals unchanged", () => {
      expect(applyJitter(0)).toBe(0);
      expect(applyJitter(-5)).toBe(-5);
    });

    it("produces non-deterministic output across calls using the real RNG", () => {
      const results = new Set(
        Array.from({ length: 20 }, () => applyJitter(20))
      );
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
