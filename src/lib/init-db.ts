import { getDb } from "./db";

export async function initializeDatabase() {
  const sql = getDb();

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

  await sql`INSERT INTO config (key, value) VALUES ('cotizacion_dolar', '1000') ON CONFLICT (key) DO NOTHING`;
  await sql`INSERT INTO config (key, value) VALUES ('moneda_display', 'ARS') ON CONFLICT (key) DO NOTHING`;
}
