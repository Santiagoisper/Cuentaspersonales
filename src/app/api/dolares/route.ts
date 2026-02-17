import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM dolares ORDER BY ubicacion`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching dolares:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const { ubicacion, detalle, monto } = await request.json();
    const montoNum = Number(monto) || 0;
    const det = detalle || null;
    const rows = await sql`INSERT INTO dolares (ubicacion, detalle, monto) VALUES (${ubicacion}, ${det}, ${montoNum}) RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error saving dolar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const { id, ubicacion, detalle, monto } = await request.json();
    const montoNum = Number(monto) || 0;
    const det = detalle || null;
    const rows = await sql`UPDATE dolares SET ubicacion = ${ubicacion}, detalle = ${det}, monto = ${montoNum}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating dolar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { id } = await request.json();
    await sql`DELETE FROM dolares WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dolar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
