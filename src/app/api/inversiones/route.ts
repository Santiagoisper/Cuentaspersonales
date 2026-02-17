import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM inversiones_cocos ORDER BY tipo, descripcion`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching inversiones:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { tipo, descripcion, monto } = await request.json();
    const montoNum = Number(monto) || 0;
    const rows = await sql`INSERT INTO inversiones_cocos (tipo, descripcion, monto, fecha) VALUES (${tipo}, ${descripcion}, ${montoNum}, CURRENT_DATE) RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error saving inversion:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const { id, tipo, descripcion, monto } = await request.json();
    const montoNum = Number(monto) || 0;
    const rows = await sql`UPDATE inversiones_cocos SET tipo = ${tipo}, descripcion = ${descripcion}, monto = ${montoNum}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating inversion:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { id } = await request.json();
    await sql`DELETE FROM inversiones_cocos WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inversion:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
