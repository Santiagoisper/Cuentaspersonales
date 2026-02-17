import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

type Row = Record<string, unknown>;

async function ensureSchema(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS egresos (
    id SERIAL PRIMARY KEY,
    anio INT NOT NULL,
    mes INT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100) NOT NULL,
    monto DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(anio, mes, categoria, subcategoria)
  )`;

  await sql`CREATE TABLE IF NOT EXISTS ingresos (
    id SERIAL PRIMARY KEY,
    anio INT NOT NULL,
    mes INT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    monto DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(anio, mes, categoria)
  )`;

  await sql`CREATE TABLE IF NOT EXISTS activos (
    id SERIAL PRIMARY KEY,
    entidad VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    monto DECIMAL(15,2) DEFAULT 0,
    fecha DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS activos_historial (
    id SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS inversiones_cocos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    monto DECIMAL(15,2) DEFAULT 0,
    fecha DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS dolares (
    id SERIAL PRIMARY KEY,
    ubicacion VARCHAR(100) NOT NULL,
    detalle VARCHAR(200),
    monto DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
}

async function resetSequence(sql: any, table: string) {
  let maxRows: Row[] = [];
  if (table === "config") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM config`) as Row[];
  if (table === "egresos") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM egresos`) as Row[];
  if (table === "ingresos") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM ingresos`) as Row[];
  if (table === "activos") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM activos`) as Row[];
  if (table === "activos_historial") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM activos_historial`) as Row[];
  if (table === "inversiones_cocos") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM inversiones_cocos`) as Row[];
  if (table === "dolares") maxRows = (await sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM dolares`) as Row[];

  const maxId = Number(maxRows[0]?.max_id || 0);
  if (maxId > 0) {
    if (table === "config") await sql`SELECT setval(pg_get_serial_sequence('config', 'id'), ${maxId}, true)`;
    if (table === "egresos") await sql`SELECT setval(pg_get_serial_sequence('egresos', 'id'), ${maxId}, true)`;
    if (table === "ingresos") await sql`SELECT setval(pg_get_serial_sequence('ingresos', 'id'), ${maxId}, true)`;
    if (table === "activos") await sql`SELECT setval(pg_get_serial_sequence('activos', 'id'), ${maxId}, true)`;
    if (table === "activos_historial") await sql`SELECT setval(pg_get_serial_sequence('activos_historial', 'id'), ${maxId}, true)`;
    if (table === "inversiones_cocos") await sql`SELECT setval(pg_get_serial_sequence('inversiones_cocos', 'id'), ${maxId}, true)`;
    if (table === "dolares") await sql`SELECT setval(pg_get_serial_sequence('dolares', 'id'), ${maxId}, true)`;
  } else {
    if (table === "config") await sql`SELECT setval(pg_get_serial_sequence('config', 'id'), 1, false)`;
    if (table === "egresos") await sql`SELECT setval(pg_get_serial_sequence('egresos', 'id'), 1, false)`;
    if (table === "ingresos") await sql`SELECT setval(pg_get_serial_sequence('ingresos', 'id'), 1, false)`;
    if (table === "activos") await sql`SELECT setval(pg_get_serial_sequence('activos', 'id'), 1, false)`;
    if (table === "activos_historial") await sql`SELECT setval(pg_get_serial_sequence('activos_historial', 'id'), 1, false)`;
    if (table === "inversiones_cocos") await sql`SELECT setval(pg_get_serial_sequence('inversiones_cocos', 'id'), 1, false)`;
    if (table === "dolares") await sql`SELECT setval(pg_get_serial_sequence('dolares', 'id'), 1, false)`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!token || !(await verifyToken(token)))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const sourceUrl = process.env.PRODUCTION_DATABASE_URL;
    const targetUrl = process.env.DATABASE_URL;

    if (!targetUrl) {
      return NextResponse.json({ error: "Falta DATABASE_URL local" }, { status: 500 });
    }
    if (!sourceUrl) {
      return NextResponse.json({ error: "Falta PRODUCTION_DATABASE_URL" }, { status: 500 });
    }

    const source = neon(sourceUrl);
    const target = neon(targetUrl);

    await ensureSchema(target);

    const configRows = (await source`SELECT id, key, value, updated_at FROM config ORDER BY id`) as Row[];
    const egresosRows = (await source`SELECT id, anio, mes, categoria, subcategoria, monto, created_at, updated_at FROM egresos ORDER BY id`) as Row[];
    const ingresosRows = (await source`SELECT id, anio, mes, categoria, monto, created_at, updated_at FROM ingresos ORDER BY id`) as Row[];
    const activosRows = (await source`SELECT id, entidad, tipo, descripcion, monto, fecha, created_at, updated_at FROM activos ORDER BY id`) as Row[];
    const historialRows = (await source`SELECT id, fecha, total, created_at FROM activos_historial ORDER BY id`) as Row[];
    const inversionesRows = (await source`SELECT id, tipo, descripcion, monto, fecha, created_at, updated_at FROM inversiones_cocos ORDER BY id`) as Row[];
    const dolaresRows = (await source`SELECT id, ubicacion, detalle, monto, created_at, updated_at FROM dolares ORDER BY id`) as Row[];

    await target`DELETE FROM config`;
    await target`DELETE FROM egresos`;
    await target`DELETE FROM ingresos`;
    await target`DELETE FROM activos`;
    await target`DELETE FROM activos_historial`;
    await target`DELETE FROM inversiones_cocos`;
    await target`DELETE FROM dolares`;

    for (const row of configRows) {
      await target`INSERT INTO config (id, key, value, updated_at) VALUES (${row.id}, ${row.key}, ${row.value}, ${row.updated_at})`;
    }
    for (const row of egresosRows) {
      await target`INSERT INTO egresos (id, anio, mes, categoria, subcategoria, monto, created_at, updated_at) VALUES (${row.id}, ${row.anio}, ${row.mes}, ${row.categoria}, ${row.subcategoria}, ${row.monto}, ${row.created_at}, ${row.updated_at})`;
    }
    for (const row of ingresosRows) {
      await target`INSERT INTO ingresos (id, anio, mes, categoria, monto, created_at, updated_at) VALUES (${row.id}, ${row.anio}, ${row.mes}, ${row.categoria}, ${row.monto}, ${row.created_at}, ${row.updated_at})`;
    }
    for (const row of activosRows) {
      await target`INSERT INTO activos (id, entidad, tipo, descripcion, monto, fecha, created_at, updated_at) VALUES (${row.id}, ${row.entidad}, ${row.tipo}, ${row.descripcion}, ${row.monto}, ${row.fecha}, ${row.created_at}, ${row.updated_at})`;
    }
    for (const row of historialRows) {
      await target`INSERT INTO activos_historial (id, fecha, total, created_at) VALUES (${row.id}, ${row.fecha}, ${row.total}, ${row.created_at})`;
    }
    for (const row of inversionesRows) {
      await target`INSERT INTO inversiones_cocos (id, tipo, descripcion, monto, fecha, created_at, updated_at) VALUES (${row.id}, ${row.tipo}, ${row.descripcion}, ${row.monto}, ${row.fecha}, ${row.created_at}, ${row.updated_at})`;
    }
    for (const row of dolaresRows) {
      await target`INSERT INTO dolares (id, ubicacion, detalle, monto, created_at, updated_at) VALUES (${row.id}, ${row.ubicacion}, ${row.detalle}, ${row.monto}, ${row.created_at}, ${row.updated_at})`;
    }

    await resetSequence(target, "config");
    await resetSequence(target, "egresos");
    await resetSequence(target, "ingresos");
    await resetSequence(target, "activos");
    await resetSequence(target, "activos_historial");
    await resetSequence(target, "inversiones_cocos");
    await resetSequence(target, "dolares");

    return NextResponse.json({
      success: true,
      message: "Local actualizado desde produccion",
      copied: {
        config: configRows.length,
        egresos: egresosRows.length,
        ingresos: ingresosRows.length,
        activos: activosRows.length,
        activos_historial: historialRows.length,
        inversiones_cocos: inversionesRows.length,
        dolares: dolaresRows.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "No se pudo actualizar local", details: message }, { status: 500 });
  }
}
