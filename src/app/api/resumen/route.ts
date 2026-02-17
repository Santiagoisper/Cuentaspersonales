import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { dedupeEgresos } from "@/lib/egresos-normalize";

function buildEmptyResumen() {
  const meses = [];
  for (let m = 1; m <= 12; m++) {
    meses.push({
      mes: m,
      ingresos: 0,
      egresos: 0,
      diferencia: 0,
    });
  }
  return meses;
}

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const anio = Number(searchParams.get("anio")) || new Date().getFullYear();

    const ingresos = await sql`SELECT mes, COALESCE(SUM(monto), 0) as total FROM ingresos WHERE anio = ${anio} GROUP BY mes ORDER BY mes`;
    const egresosRows = await sql`SELECT id, anio, mes, categoria, subcategoria, monto, updated_at FROM egresos WHERE anio = ${anio}`;
    const egresos = dedupeEgresos(egresosRows).reduce((acc: Map<number, number>, row) => {
      const mes = Number(row.mes);
      const prev = acc.get(mes) || 0;
      acc.set(mes, prev + Number(row.monto || 0));
      return acc;
    }, new Map<number, number>());

    const meses = [];
    for (let m = 1; m <= 12; m++) {
      const ing = ingresos.find((r) => Number(r.mes) === m);
      const totalEgresos = egresos.get(m) || 0;
      const totalIngresos = ing ? Number(ing.total) : 0;
      meses.push({
        mes: m,
        ingresos: totalIngresos,
        egresos: totalEgresos,
        diferencia: totalIngresos - totalEgresos,
      });
    }

    return NextResponse.json(meses);
  } catch (error) {
    console.error("Error fetching resumen:", error);
    return NextResponse.json(buildEmptyResumen());
  }
}
