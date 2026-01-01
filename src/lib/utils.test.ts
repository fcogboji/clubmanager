import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, formatCurrency, getGreeting, getDayOfWeek } from "./utils";

describe("Utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
    });

    it("should merge tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });
  });

  describe("formatCurrency", () => {
    it("should format amount in pence to GBP", () => {
      expect(formatCurrency(1000)).toBe("£10.00");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("£0.00");
    });

    it("should handle decimal amounts", () => {
      expect(formatCurrency(1050)).toBe("£10.50");
    });

    it("should handle large amounts", () => {
      expect(formatCurrency(100000)).toBe("£1,000.00");
    });
  });

  describe("getGreeting", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'Good morning' before noon", () => {
      vi.setSystemTime(new Date("2024-01-01T09:00:00"));
      expect(getGreeting()).toBe("Good morning");
    });

    it("should return 'Good afternoon' between noon and 6pm", () => {
      vi.setSystemTime(new Date("2024-01-01T14:00:00"));
      expect(getGreeting()).toBe("Good afternoon");
    });

    it("should return 'Good evening' after 6pm", () => {
      vi.setSystemTime(new Date("2024-01-01T20:00:00"));
      expect(getGreeting()).toBe("Good evening");
    });
  });

  describe("getDayOfWeek", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return the correct day of week", () => {
      vi.setSystemTime(new Date("2024-01-01T12:00:00")); // Monday
      expect(getDayOfWeek()).toBe("Monday");
    });

    it("should return Sunday for a Sunday", () => {
      vi.setSystemTime(new Date("2024-01-07T12:00:00")); // Sunday
      expect(getDayOfWeek()).toBe("Sunday");
    });
  });
});
