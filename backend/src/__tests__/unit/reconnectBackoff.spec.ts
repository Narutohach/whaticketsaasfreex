import {
  calculateReconnectDelay,
  hasExceededReconnectAttempts,
  MAX_RECONNECT_ATTEMPTS
} from "../../helpers/ReconnectBackoff";

describe("ReconnectBackoff Helper", () => {
  describe("calculateReconnectDelay", () => {
    it("returns the base delay (plus jitter) on the first attempt", () => {
      const delay = calculateReconnectDelay(0, () => 0);
      expect(delay).toBe(2000);
    });

    it("grows exponentially with the attempt number", () => {
      const noJitter = () => 0;
      expect(calculateReconnectDelay(0, noJitter)).toBe(2000);
      expect(calculateReconnectDelay(1, noJitter)).toBe(4000);
      expect(calculateReconnectDelay(2, noJitter)).toBe(8000);
      expect(calculateReconnectDelay(3, noJitter)).toBe(16000);
    });

    it("caps the delay at 60 seconds even for very high attempt counts", () => {
      const delay = calculateReconnectDelay(20, () => 0);
      expect(delay).toBeLessThanOrEqual(60000 * 1.3);
      expect(delay).toBeGreaterThanOrEqual(60000);
    });

    it("adds jitter proportional to the random function output", () => {
      const delayNoJitter = calculateReconnectDelay(2, () => 0);
      const delayMaxJitter = calculateReconnectDelay(2, () => 1);
      expect(delayMaxJitter).toBeGreaterThan(delayNoJitter);
      // jitter ratio is 30% of the exponential delay
      expect(delayMaxJitter - delayNoJitter).toBeCloseTo(8000 * 0.3, 0);
    });

    it("never returns a negative delay for a negative attempt", () => {
      const delay = calculateReconnectDelay(-5, () => 0);
      expect(delay).toBe(2000);
    });
  });

  describe("hasExceededReconnectAttempts", () => {
    it("is false while under the max attempts", () => {
      expect(hasExceededReconnectAttempts(0)).toBe(false);
      expect(hasExceededReconnectAttempts(MAX_RECONNECT_ATTEMPTS - 1)).toBe(false);
    });

    it("is true once the max attempts is reached or exceeded", () => {
      expect(hasExceededReconnectAttempts(MAX_RECONNECT_ATTEMPTS)).toBe(true);
      expect(hasExceededReconnectAttempts(MAX_RECONNECT_ATTEMPTS + 5)).toBe(true);
    });
  });
});
