/**
 * Módulo de interés compuesto (Finance Agent).
 * Fórmula: A = P * (1 + r/n)^(n*t)
 * - P = capital inicial, r = tasa anual (decimal), n = frec. capitalización/año, t = años.
 */

/**
 * Monto final con capitalización mensual.
 * n = 12, t = meses/12.
 *
 * @param principal - Capital inicial (>= 0)
 * @param annualRateDecimal - Tasa anual en decimal (ej: 0.10 = 10%). Debe ser >= 0.
 * @param months - Cantidad de meses (>= 0)
 * @returns Monto final (redondeado a 2 decimales)
 */
export function compoundMonthly(
  principal: number,
  annualRateDecimal: number,
  months: number
): number {
  if (principal < 0 || annualRateDecimal < 0 || months < 0) {
    throw new Error(
      "compoundMonthly: principal, annualRateDecimal y months deben ser >= 0"
    );
  }
  if (months === 0 || annualRateDecimal === 0) {
    return round2(principal);
  }
  const n = 12;
  const t = months / 12;
  const amount = principal * Math.pow(1 + annualRateDecimal / n, n * t);
  return round2(amount);
}

/**
 * Monto final con capitalización anual.
 * n = 1, t = años (meses/12).
 *
 * @param principal - Capital inicial (>= 0)
 * @param annualRateDecimal - Tasa anual en decimal (ej: 0.10 = 10%). Debe ser >= 0.
 * @param months - Cantidad de meses (>= 0)
 * @returns Monto final (redondeado a 2 decimales)
 */
export function compoundAnnual(
  principal: number,
  annualRateDecimal: number,
  months: number
): number {
  if (principal < 0 || annualRateDecimal < 0 || months < 0) {
    throw new Error(
      "compoundAnnual: principal, annualRateDecimal y months deben ser >= 0"
    );
  }
  if (months === 0 || annualRateDecimal === 0) {
    return round2(principal);
  }
  const n = 1;
  const t = months / 12;
  const amount = principal * Math.pow(1 + annualRateDecimal / n, n * t);
  return round2(amount);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/* ========== Ejemplos de uso ==========

  // Capital $100_000, 10% anual, 12 meses
  compoundMonthly(100_000, 0.10, 12);  // ~110471.31
  compoundAnnual(100_000, 0.10, 12);    // 110000

  // Casos borde: tasa 0 → devuelve el capital
  compoundMonthly(50_000, 0, 24);      // 50000
  compoundAnnual(50_000, 0, 24);       // 50000

  // Casos borde: meses 0 → devuelve el capital
  compoundMonthly(80_000, 0.15, 0);    // 80000
  compoundAnnual(80_000, 0.15, 0);     // 80000

  // Tasa y meses 0
  compoundMonthly(1_000, 0, 0);        // 1000
  compoundAnnual(1_000, 0, 0);        // 1000

  // Inputs inválidos (lanzan)
  compoundMonthly(-100, 0.1, 12);      // Error
  compoundAnnual(100, -0.1, 12);       // Error
  compoundMonthly(100, 0.1, -1);       // Error

========== */
