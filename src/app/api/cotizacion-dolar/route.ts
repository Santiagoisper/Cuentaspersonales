import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT value FROM config WHERE key = 'cotizacion_dolar' LIMIT 1`;
    const cotizacion = Number(rows[0]?.value ?? "1000") || 1000;

    return NextResponse.json({
      cotizacion,
      source: "manual"
    });
  } catch (error) {
    console.error("Error fetching dolar cotizacion:", error);
    return NextResponse.json({
      cotizacion: 1000,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
