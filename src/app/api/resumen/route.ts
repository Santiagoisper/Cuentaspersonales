import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const anio = Number(searchParams.get("anio")) || new Date().getFullYear();

    const ingresos = await sql`SELECT mes, COALESCE(SUM(monto), 0) as total FROM ingresos WHERE anio = ${anio} GROUP BY mes ORDER BY mes`;
    const egresos = await sql`SELECT mes, COALESCE(SUM(monto), 0) as total FROM egresos WHERE anio = ${anio} GROUP BY mes ORDER BY mes`;

    const meses = [];
    for (let m = 1; m <= 12; m++) {
      const ing = ingresos.find((r) => Number(r.mes) === m);
      const egr = egresos.find((r) => Number(r.mes) === m);
      const totalIngresos = ing ? Number(ing.total) : 0;
      const totalEgresos = egr ? Number(egr.total) : 0;
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
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
