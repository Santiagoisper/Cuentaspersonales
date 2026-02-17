import { neon } from "@neondatabase/serverless";

function normalizeDatabaseUrl(raw: string | undefined): string {
  const value = String(raw || "").trim();
  if (!value) return "";

  const match = value.match(/postgres(?:ql)?:\/\/[^'"\s]+/i);
  if (match?.[0]) return match[0];
  return value;
}

export function getDb() {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no configurada");
  }
  const sql = neon(databaseUrl);
  return sql;
}
