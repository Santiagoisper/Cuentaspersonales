type EgresoLike = {
  id?: number;
  anio?: number;
  mes?: number;
  categoria?: string;
  subcategoria?: string;
  monto?: number | string;
  updated_at?: string;
};

function cleanText(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\s]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCategoria(value: string): string {
  const raw = String(value || "").trim();
  const c = cleanText(raw);

  if (c === "vivienda") return "Vivienda";
  if (c === "educacion") return "Educacion";
  if (c === "tarjeta" || c === "tarjetas") return "Tarjetas";
  if (c === "servicio" || c === "servicios") return "Servicios";
  if (c === "personal" || c === "personales") return "Personales";
  if (c === "vehiculo" || c === "vehiculos") return "Vehiculos";
  if (c === "limpieza") return "Limpieza";

  return raw || "Sin categoria";
}

export function normalizeSubcategoria(categoria: string, value: string): string {
  const raw = String(value || "").trim();
  const s = cleanText(raw);

  if (categoria === "Educacion") {
    if (s.includes("pestalozzi")) return "Pestalozzi";
    if (s.includes("san andr")) return "Uni. de San Andres";
  }

  if (categoria === "Vehiculos") {
    if (s.includes("patente moto")) return "Patente Moto";
    if (s.includes("patente auto")) return "Patente Auto";
  }

  if (categoria === "Tarjetas") {
    if (s.includes("amex")) return "Amex";
    if (s.includes("visa")) return "Visa Galicia";
    if (s.includes("master")) return "Master Galicia";
    if (s.includes("ml")) return "Tarjeta ML";
  }

  return raw || "Sin subcategoria";
}

export function normalizeEgreso<T extends EgresoLike>(row: T): T {
  const categoria = normalizeCategoria(String(row.categoria || ""));
  const subcategoria = normalizeSubcategoria(categoria, String(row.subcategoria || ""));
  return {
    ...row,
    categoria,
    subcategoria,
    monto: Number(row.monto || 0),
  };
}

export function dedupeEgresos<T extends EgresoLike>(rows: T[]): T[] {
  const byKey = new Map<string, T>();

  for (const raw of rows) {
    const row = normalizeEgreso(raw);
    const key = `${row.anio ?? ""}-${row.mes ?? ""}-${row.categoria}-${row.subcategoria}`;
    const prev = byKey.get(key);

    if (!prev) {
      byKey.set(key, row);
      continue;
    }

    const prevTs = prev.updated_at ? new Date(prev.updated_at).getTime() : 0;
    const curTs = row.updated_at ? new Date(row.updated_at).getTime() : 0;
    const prevId = Number(prev.id || 0);
    const curId = Number(row.id || 0);

    if (curTs > prevTs || (curTs === prevTs && curId > prevId)) {
      byKey.set(key, row);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const ca = String(a.categoria || "");
    const cb = String(b.categoria || "");
    if (ca !== cb) return ca.localeCompare(cb);
    return String(a.subcategoria || "").localeCompare(String(b.subcategoria || ""));
  });
}
