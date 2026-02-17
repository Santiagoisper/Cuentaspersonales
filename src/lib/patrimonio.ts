type SqlClient = any;

export interface PatrimonioBreakdown {
  activos_ars: number;
  inversiones_cocos_sin_cauciones_ars: number;
  ultima_caucion_ars: number;
  ultima_caucion_fecha: string | null;
  dolares_usd: number;
  cotizacion_dolar: number;
  dolares_ars: number;
  total_ars: number;
}

export interface PatrimonioComparacion {
  hoy_fecha: string;
  ayer_fecha: string;
  hoy_total_ars: number;
  ayer_total_ars: number;
  variacion_ars: number;
  variacion_pct: number | null;
  tiene_dato_ayer: boolean;
}

export async function getPatrimonioBreakdown(sql: SqlClient): Promise<PatrimonioBreakdown> {
  const activosResult = await sql`SELECT COALESCE(SUM(monto), 0) AS total FROM activos`;
  const totalActivos = Number(activosResult[0]?.total || 0);

  const inversionesSinCaucionResult = await sql`
    SELECT COALESCE(SUM(monto), 0) AS total
    FROM inversiones_cocos
    WHERE UPPER(TRIM(tipo)) <> 'CAUCIONES'
  `;
  const inversionesSinCaucion = Number(inversionesSinCaucionResult[0]?.total || 0);

  const ultimaCaucionResult = await sql`
    SELECT COALESCE(monto, 0) AS monto, fecha
    FROM inversiones_cocos
    WHERE UPPER(TRIM(tipo)) = 'CAUCIONES'
    ORDER BY fecha DESC, id DESC
    LIMIT 1
  `;
  const ultimaCaucion = Number(ultimaCaucionResult[0]?.monto || 0);
  const ultimaCaucionFecha = ultimaCaucionResult[0]?.fecha ? String(ultimaCaucionResult[0].fecha).slice(0, 10) : null;

  const dolaresResult = await sql`SELECT COALESCE(SUM(monto), 0) AS total FROM dolares`;
  const dolaresUsd = Number(dolaresResult[0]?.total || 0);

  const cotizacionResult = await sql`SELECT value FROM config WHERE key = 'cotizacion_dolar' LIMIT 1`;
  const cotizacion = Number(cotizacionResult[0]?.value || 1000) || 1000;

  const dolaresArs = dolaresUsd * cotizacion;
  const totalArs = totalActivos + inversionesSinCaucion + ultimaCaucion + dolaresArs;

  return {
    activos_ars: totalActivos,
    inversiones_cocos_sin_cauciones_ars: inversionesSinCaucion,
    ultima_caucion_ars: ultimaCaucion,
    ultima_caucion_fecha: ultimaCaucionFecha,
    dolares_usd: dolaresUsd,
    cotizacion_dolar: cotizacion,
    dolares_ars: dolaresArs,
    total_ars: totalArs,
  };
}

export async function syncPatrimonioHistorial(sql: SqlClient): Promise<number> {
  const breakdown = await getPatrimonioBreakdown(sql);
  await sql`INSERT INTO activos_historial (fecha, total) VALUES (CURRENT_DATE, ${breakdown.total_ars})
    ON CONFLICT (fecha) DO UPDATE SET total = ${breakdown.total_ars}`;
  return breakdown.total_ars;
}

export async function getPatrimonioComparacion(sql: SqlClient): Promise<PatrimonioComparacion> {
  const todayTotal = await syncPatrimonioHistorial(sql);

  const rows = await sql`
    SELECT
      CURRENT_DATE::text AS hoy_fecha,
      (CURRENT_DATE - INTERVAL '1 day')::date::text AS ayer_fecha,
      COALESCE((SELECT total FROM activos_historial WHERE fecha = (CURRENT_DATE - INTERVAL '1 day')::date LIMIT 1), 0) AS ayer_total
  `;

  const hoyFecha = String(rows[0]?.hoy_fecha);
  const ayerFecha = String(rows[0]?.ayer_fecha);
  const hoyTotal = Number(todayTotal || 0);
  const ayerTotal = Number(rows[0]?.ayer_total || 0);
  const variacion = hoyTotal - ayerTotal;
  const variacionPct = ayerTotal > 0 ? (variacion / ayerTotal) * 100 : null;

  return {
    hoy_fecha: hoyFecha,
    ayer_fecha: ayerFecha,
    hoy_total_ars: hoyTotal,
    ayer_total_ars: ayerTotal,
    variacion_ars: variacion,
    variacion_pct: variacionPct,
    tiene_dato_ayer: ayerTotal > 0,
  };
}
