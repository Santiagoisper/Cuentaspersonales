/**
 * QA Agent: tests para compoundInterest.ts
 * Casos numéricos verificables (fórmula A = P * (1 + r/n)^(n*t)).
 */
import { describe, it, expect } from "vitest";
import { compoundMonthly, compoundAnnual } from "../src/lib/finance/compoundInterest";

describe("compoundMonthly", () => {
  it("capital 100_000, 10% anual, 12 meses → 110471.31 (verificado: 100000 * (1+0.10/12)^12)", () => {
    expect(compoundMonthly(100_000, 0.1, 12)).toBe(110471.31);
  });

  it("capital 1_000, 12% anual, 24 meses → 1269.73 (verificado: 1000 * (1.01)^24)", () => {
    expect(compoundMonthly(1_000, 0.12, 24)).toBe(1269.73);
  });

  it("caso borde: tasa 0 devuelve el capital", () => {
    expect(compoundMonthly(50_000, 0, 24)).toBe(50_000);
  });

  it("caso borde: meses 0 devuelve el capital", () => {
    expect(compoundMonthly(80_000, 0.15, 0)).toBe(80_000);
  });

  it("caso borde: tasa 0 y meses 0 devuelve el capital", () => {
    expect(compoundMonthly(1_000, 0, 0)).toBe(1_000);
  });

  it("lanza si principal < 0", () => {
    expect(() => compoundMonthly(-100, 0.1, 12)).toThrow(/>= 0/);
  });

  it("lanza si tasa < 0", () => {
    expect(() => compoundMonthly(100, -0.1, 12)).toThrow(/>= 0/);
  });

  it("lanza si months < 0", () => {
    expect(() => compoundMonthly(100, 0.1, -1)).toThrow(/>= 0/);
  });
});

describe("compoundAnnual", () => {
  it("capital 100_000, 10% anual, 12 meses (1 año) → 110000 exacto", () => {
    expect(compoundAnnual(100_000, 0.1, 12)).toBe(110_000);
  });

  it("capital 1_000, 12% anual, 24 meses (2 años) → 1254.40 (1000 * 1.12^2)", () => {
    expect(compoundAnnual(1_000, 0.12, 24)).toBe(1254.4);
  });

  it("caso borde: tasa 0 devuelve el capital", () => {
    expect(compoundAnnual(50_000, 0, 24)).toBe(50_000);
  });

  it("caso borde: meses 0 devuelve el capital", () => {
    expect(compoundAnnual(80_000, 0.15, 0)).toBe(80_000);
  });

  it("caso borde: tasa 0 y meses 0 devuelve el capital", () => {
    expect(compoundAnnual(1_000, 0, 0)).toBe(1_000);
  });

  it("lanza si principal < 0", () => {
    expect(() => compoundAnnual(-100, 0.1, 12)).toThrow(/>= 0/);
  });

  it("lanza si tasa < 0", () => {
    expect(() => compoundAnnual(100, -0.1, 12)).toThrow(/>= 0/);
  });

  it("lanza si months < 0", () => {
    expect(() => compoundAnnual(100, 0.1, -1)).toThrow(/>= 0/);
  });
});
