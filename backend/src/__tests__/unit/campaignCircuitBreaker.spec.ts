import {
  createEmptyCampaignStats,
  recordAttempt,
  shouldCircuitBreak
} from "../../helpers/CampaignCircuitBreaker";

describe("CampaignCircuitBreaker Helper", () => {
  describe("recordAttempt", () => {
    it("starts from an empty state", () => {
      expect(createEmptyCampaignStats()).toEqual({
        consecutiveFailures: 0,
        totalAttempts: 0,
        totalFailures: 0
      });
    });

    it("resets consecutive failures on success but keeps totals", () => {
      let stats = createEmptyCampaignStats();
      stats = recordAttempt(stats, false);
      stats = recordAttempt(stats, false);
      stats = recordAttempt(stats, true);

      expect(stats).toEqual({
        consecutiveFailures: 0,
        totalAttempts: 3,
        totalFailures: 2
      });
    });

    it("accumulates consecutive failures", () => {
      let stats = createEmptyCampaignStats();
      stats = recordAttempt(stats, false);
      stats = recordAttempt(stats, false);
      stats = recordAttempt(stats, false);

      expect(stats.consecutiveFailures).toBe(3);
      expect(stats.totalFailures).toBe(3);
      expect(stats.totalAttempts).toBe(3);
    });
  });

  describe("shouldCircuitBreak", () => {
    it("trips after enough consecutive failures", () => {
      let stats = createEmptyCampaignStats();
      for (let i = 0; i < 4; i++) stats = recordAttempt(stats, false);
      expect(shouldCircuitBreak(stats)).toBe(false);

      stats = recordAttempt(stats, false);
      expect(shouldCircuitBreak(stats)).toBe(true);
    });

    it("does not trip on a healthy mix of successes and failures", () => {
      let stats = createEmptyCampaignStats();
      for (let i = 0; i < 20; i++) {
        stats = recordAttempt(stats, i % 5 !== 0); // 20% failure rate, never consecutive
      }
      expect(shouldCircuitBreak(stats)).toBe(false);
    });

    it("trips on a high failure rate even without long failure streaks", () => {
      // 7 failures / 5 successes, no run longer than 2 consecutive failures.
      const succeededSequence = [
        false, true, false, true, false, true,
        false, true, false, true, false, false
      ];
      let stats = createEmptyCampaignStats();
      succeededSequence.forEach(succeeded => {
        stats = recordAttempt(stats, succeeded);
      });

      expect(stats.totalFailures / stats.totalAttempts).toBeGreaterThan(0.5);
      expect(shouldCircuitBreak(stats)).toBe(true);
    });

    it("ignores the failure rate until the minimum sample size is reached", () => {
      let stats = createEmptyCampaignStats();
      stats = recordAttempt(stats, false);
      stats = recordAttempt(stats, true);
      stats = recordAttempt(stats, false);
      // 2/3 failures, well above the 50% threshold, but too few attempts
      expect(shouldCircuitBreak(stats, { minAttemptsBeforeRateCheck: 10 })).toBe(false);
    });

    it("respects custom thresholds", () => {
      let stats = createEmptyCampaignStats();
      stats = recordAttempt(stats, false);
      stats = recordAttempt(stats, false);
      expect(shouldCircuitBreak(stats, { maxConsecutiveFailures: 2 })).toBe(true);
      expect(shouldCircuitBreak(stats, { maxConsecutiveFailures: 3 })).toBe(false);
    });
  });
});
