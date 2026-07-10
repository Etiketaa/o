import { describe, it, expect } from "vitest";
import { getInitials, formatMoney, formatDate, isPlanExpired } from "../utils";

describe("getInitials", () => {
  it("returns first two initials from full name", () => {
    expect(getInitials("Martina Suárez")).toBe("MS");
  });

  it("returns first char for single name", () => {
    expect(getInitials("Franco")).toBe("F");
  });

  it("handles three names", () => {
    expect(getInitials("Juan Pedro López")).toBe("JP");
  });
});

describe("formatMoney", () => {
  it("formats Argentine pesos", () => {
    const result = formatMoney(15000);
    expect(result).toContain("15.000");
  });

  it("formats zero", () => {
    const result = formatMoney(0);
    expect(result).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    const result = formatDate("2025-07-01");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{2}/);
  });
});

describe("isPlanExpired", () => {
  it("returns true for past dates", () => {
    expect(isPlanExpired("2020-01-01")).toBe(true);
  });

  it("returns false for future dates", () => {
    expect(isPlanExpired("2030-12-31")).toBe(false);
  });
});
