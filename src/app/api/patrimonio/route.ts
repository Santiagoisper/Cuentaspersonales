import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { dedupeEgresos } from "@/lib/egresos-normalize";
import { getPatrimonioBreakdown, getPatrimonioComparacion } from "@/lib/patrimonio";

function toPeriodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function lastMonths(base: Date, count: number): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

export async function GET() {
  try {
    const sql = getDb();

    const breakdown = await getPatrimonioBreakdown(sql);
    const comparacion = await getPatrimonioComparacion(sql);

    const historyRows = await sql`SELECT fecha, total FROM activos_historial ORDER BY fecha DESC LIMIT 120`;
    const historial = historyRows.map((r: Record<string, any>) => ({
      fecha: String(r.fecha).slice(0, 10),
      total_ars: Number(r.total || 0),
    }));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const ingresosRows = await sql`SELECT mes, COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE anio = ${currentYear} GROUP BY mes`;
    const ingresoMesActual = Number(
      (ingresosRows as Array<Record<string, any>>).find((r) => Number(r.mes) === currentMonth)?.total || 0
    );

    const egresosWindow = lastMonths(now, 3);
    const years = Array.from(new Set(egresosWindow.map((m) => m.year)));
    const egresosRows = await sql`SELECT id, anio, mes, categoria, subcategoria, monto, updated_at FROM egresos WHERE anio = ANY(${years})`;
    const egresosDeduped = dedupeEgresos(egresosRows);

    const egresosByPeriod = new Map<string, number>();
    for (const row of egresosDeduped) {
      const key = toPeriodKey(Number(row.anio), Number(row.mes));
      egresosByPeriod.set(key, (egresosByPeriod.get(key) || 0) + Number(row.monto || 0));
    }

    const egresoMesActual = egresosByPeriod.get(toPeriodKey(currentYear, currentMonth)) || 0;
    const ahorroMensualPct = ingresoMesActual > 0 ? ((ingresoMesActual - egresoMesActual) / ingresoMesActual) * 100 : null;

    const avgEgreso3m =
      egresosWindow.reduce((sum, m) => sum + (egresosByPeriod.get(toPeriodKey(m.year, m.month)) || 0), 0) / egresosWindow.length;
    const runwayMeses = avgEgreso3m > 0 ? breakdown.total_ars / avgEgreso3m : null;

    const total = breakdown.total_ars;
    const concentration = {
      activos_e_inversiones_entidades_pct: total > 0 ? (breakdown.activos_ars / total) * 100 : 0,
      cocos_sin_cauciones_pct: total > 0 ? (breakdown.inversiones_cocos_sin_cauciones_ars / total) * 100 : 0,
      ultima_caucion_pct: total > 0 ? (breakdown.ultima_caucion_ars / total) * 100 : 0,
      dolares_pct: total > 0 ? (breakdown.dolares_ars / total) * 100 : 0,
    };

    const savingsScore = Math.max(0, Math.min(100, ((ahorroMensualPct ?? 0) + 20) * 2.5));
    const runwayScore = Math.max(0, Math.min(100, ((runwayMeses ?? 0) / 24) * 100));
    const maxConcentration = Math.max(
      concentration.activos_e_inversiones_entidades_pct,
      concentration.cocos_sin_cauciones_pct,
      concentration.ultima_caucion_pct,
      concentration.dolares_pct
    );
    const diversificationScore = Math.max(0, Math.min(100, 100 - (maxConcentration - 25) * 1.6));
    const scoreFinanciero = savingsScore * 0.4 + runwayScore * 0.35 + diversificationScore * 0.25;

    return NextResponse.json({
      breakdown,
      comparacion,
      historial,
      metricas: {
        ahorro_mensual_pct: ahorroMensualPct,
        runway_meses: runwayMeses,
        ingresos_mes_actual_ars: ingresoMesActual,
        egresos_mes_actual_ars: egresoMesActual,
        egreso_promedio_3m_ars: avgEgreso3m,
        score_financiero_100: scoreFinanciero,
      },
      concentracion: concentration,
    });
  } catch (error) {
    console.error("Error fetching patrimonio:", error);
    return NextResponse.json(
      {
        error: "No se pudo calcular patrimonio.",
        breakdown: null,
        comparacion: null,
        historial: [],
        metricas: null,
        concentracion: null,
      },
      { status: 500 }
    );
  }
}
