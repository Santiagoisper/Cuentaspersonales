import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const anio = Number(searchParams.get("anio")) || new Date().getFullYear();
    const mes = Number(searchParams.get("mes")) || new Date().getMonth() + 1;

    const rows = await sql`SELECT * FROM ingresos WHERE anio = ${anio} AND mes = ${mes} ORDER BY categoria`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching ingresos:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { id, anio, mes, categoria, monto } = await request.json();
    const montoNum = Number(monto) || 0;
    const idNum = Number(id);

    if (idNum > 0) {
      const rows = await sql`UPDATE ingresos
         SET categoria = ${categoria}, monto = ${montoNum}, updated_at = NOW()
         WHERE id = ${idNum}
         RETURNING *`;
      return NextResponse.json(rows[0] || null);
    }

    const rows = await sql`INSERT INTO ingresos (anio, mes, categoria, monto)
       VALUES (${anio}, ${mes}, ${categoria}, ${montoNum})
       ON CONFLICT (anio, mes, categoria)
       DO UPDATE SET monto = ${montoNum}, updated_at = NOW()
       RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error saving ingreso:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { id } = await request.json();
    await sql`DELETE FROM ingresos WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ingreso:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
