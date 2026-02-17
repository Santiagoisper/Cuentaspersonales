import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { syncPatrimonioHistorial } from "@/lib/patrimonio";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT key, value FROM config`;
    const config: Record<string, string> = {};
    for (const r of rows) {
      config[r.key as string] = r.value as string;
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json({
      cotizacion_dolar: "1000",
      moneda_display: "ARS",
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const { key, value } = await request.json();
    await sql`INSERT INTO config (key, value, updated_at) VALUES (${key}, ${value}, NOW()) ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()`;
    if (key === "cotizacion_dolar") {
      await syncPatrimonioHistorial(sql);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json({ success: false });
  }
}
