import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const activos = await sql`SELECT * FROM activos ORDER BY entidad, tipo, descripcion`;
    const historial = await sql`SELECT * FROM activos_historial ORDER BY fecha DESC LIMIT 30`;
    return NextResponse.json({ activos, historial });
  } catch (error) {
    console.error("Error fetching activos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { entidad, tipo, descripcion, monto } = await request.json();
    const montoNum = Number(monto) || 0;

    const rows = await sql`INSERT INTO activos (entidad, tipo, descripcion, monto, fecha)
       VALUES (${entidad}, ${tipo}, ${descripcion}, ${montoNum}, CURRENT_DATE)
       RETURNING *`;

    const totalResult = await sql`SELECT COALESCE(SUM(monto), 0) as total FROM activos`;
    const total = totalResult[0].total;
    await sql`INSERT INTO activos_historial (fecha, total) VALUES (CURRENT_DATE, ${total})
       ON CONFLICT (fecha) DO UPDATE SET total = ${total}`;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error saving activo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const { id, entidad, tipo, descripcion, monto } = await request.json();
    const montoNum = Number(monto) || 0;

    const rows = await sql`UPDATE activos SET entidad = ${entidad}, tipo = ${tipo}, descripcion = ${descripcion}, monto = ${montoNum}, updated_at = NOW()
       WHERE id = ${id} RETURNING *`;

    const totalResult = await sql`SELECT COALESCE(SUM(monto), 0) as total FROM activos`;
    const total = totalResult[0].total;
    await sql`INSERT INTO activos_historial (fecha, total) VALUES (CURRENT_DATE, ${total})
       ON CONFLICT (fecha) DO UPDATE SET total = ${total}`;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating activo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { id } = await request.json();
    await sql`DELETE FROM activos WHERE id = ${id}`;

    const totalResult = await sql`SELECT COALESCE(SUM(monto), 0) as total FROM activos`;
    const total = totalResult[0].total;
    await sql`INSERT INTO activos_historial (fecha, total) VALUES (CURRENT_DATE, ${total})
       ON CONFLICT (fecha) DO UPDATE SET total = ${total}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting activo:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
