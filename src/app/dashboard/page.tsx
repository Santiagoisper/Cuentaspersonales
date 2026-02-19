"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DollarBanner from "@/components/DollarBanner";
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MESES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface ResumenMes {
  mes: number;
  ingresos: number;
  egresos: number;
  diferencia: number;
}

interface PatrimonioResponse {
  breakdown: {
    activos_ars: number;
    inversiones_cocos_sin_cauciones_ars: number;
    ultima_caucion_ars: number;
    ultima_caucion_fecha: string | null;
    dolares_usd: number;
    cotizacion_dolar: number;
    dolares_ars: number;
    total_ars: number;
  } | null;
  comparacion: {
    variacion_ars: number;
    variacion_pct: number | null;
    tiene_dato_ayer: boolean;
  } | null;
  metricas: {
    ahorro_mensual_pct: number | null;
    runway_meses: number | null;
    ingresos_mes_actual_ars: number;
    egresos_mes_actual_ars: number;
    egreso_promedio_3m_ars: number;
    score_financiero_100: number;
  } | null;
  concentracion: {
    activos_e_inversiones_entidades_pct: number;
    cocos_sin_cauciones_pct: number;
    ultima_caucion_pct: number;
    dolares_pct: number;
  } | null;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenMes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");
  const [patrimonioData, setPatrimonioData] = useState<PatrimonioResponse | null>(null);
  const [patrimonioError, setPatrimonioError] = useState<string | null>(null);
  const [updatingLocal, setUpdatingLocal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const loadPatrimonio = useCallback(() => {
    return fetch("/api/patrimonio")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "No se pudo cargar patrimonio.");
        return data as PatrimonioResponse;
      })
      .then((data) => {
        setPatrimonioData(data);
        setPatrimonioError(null);
      })
      .catch(() => {
        setPatrimonioData(null);
        setPatrimonioError("No se pudo cargar el patrimonio consolidado.");
      });
  }, []);

  useEffect(() => {
    fetch(`/api/resumen?anio=${new Date().getFullYear()}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data?.error || "No se pudo cargar el resumen.");
        }
        if (!Array.isArray(data)) {
          throw new Error("Respuesta invalida del resumen.");
        }
        return data as ResumenMes[];
      })
      .then((data) => {
        setResumen(data);
        setError(null);
      })
      .catch((err) => {
        setResumen([]);
        setError(err instanceof Error ? err.message : "Error al cargar datos.");
      })
      .finally(() => setLoading(false));

    loadPatrimonio();
  }, [loadPatrimonio]);

  const formatMonto = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nn-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--nn-true-blue)] border-t-transparent" />
          <p className="text-sm text-[var(--nn-text-muted)]">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--nn-bg)]">
        <Sidebar />
        <main className="px-5 pb-8 md:px-10 md:pr-[18rem]">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-[var(--nn-border-strong)] bg-[var(--nn-snow-white)] p-6">
              <h1 className="mb-2 text-xl font-bold text-[var(--nn-true-blue)]">Error al cargar el dashboard</h1>
              <p className="text-[#b42355]">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const mesActual = new Date().getMonth();
  const totalIngresosAnio = resumen.reduce((s, r) => s + r.ingresos, 0);
  const totalEgresosAnio = resumen.reduce((s, r) => s + r.egresos, 0);
  const ingMesActual = resumen[mesActual]?.ingresos || 0;
  const egrMesActual = resumen[mesActual]?.egresos || 0;
  const ingMesAnterior = mesActual > 0 ? resumen[mesActual - 1]?.ingresos || 0 : 0;
  const egrMesAnterior = mesActual > 0 ? resumen[mesActual - 1]?.egresos || 0 : 0;

  const diffIng = ingMesAnterior > 0 ? ((ingMesActual - ingMesAnterior) / ingMesAnterior * 100) : 0;
  const diffEgr = egrMesAnterior > 0 ? ((egrMesActual - egrMesAnterior) / egrMesAnterior * 100) : 0;

  const chartData = resumen.map((r) => ({
    name: MESES_SHORT[r.mes - 1],
    Ingresos: moneda === "USD" ? Math.round(r.ingresos / cotizacion) : r.ingresos,
    Egresos: moneda === "USD" ? Math.round(r.egresos / cotizacion) : r.egresos,
  }));
  const patrimonioTotalPesos = Number(patrimonioData?.breakdown?.total_ars || 0);
  const ahorroMensualPct = patrimonioData?.metricas?.ahorro_mensual_pct ?? null;
  const runwayMeses = patrimonioData?.metricas?.runway_meses ?? null;
  const scoreFinanciero = patrimonioData?.metricas?.score_financiero_100 ?? null;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-[var(--nn-true-blue)]";
    if (score < 40) return "text-[#cf2f61]";
    if (score < 70) return "text-[#c68900]";
    return "text-[#12945f]";
  };

  const getAhorroColor = (pct: number | null) => {
    if (pct === null) return "text-[var(--nn-true-blue)]";
    if (pct < 10) return "text-[#cf2f61]";
    if (pct < 25) return "text-[#c68900]";
    return "text-[#12945f]";
  };

  const handleUpdateLocal = async () => {
    const ok = window.confirm("Va a traer codigo de git y luego datos de produccion a tu localhost. Continuar?");
    if (!ok) return;

    setUpdatingLocal(true);
    setSyncStatus("Trayendo codigo de git...");
    try {
      const pullRes = await fetch("/api/git/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const pullData = await pullRes.json();
      if (!pullRes.ok) throw new Error(pullData?.details || pullData?.error || "Error en pull");

      setSyncStatus("Sincronizando datos de produccion...");
      const syncRes = await fetch("/api/data/sync-from-production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const syncData = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncData?.details || syncData?.error || "Error en sync remoto->local");

      setSyncStatus("Local actualizado con codigo y datos de produccion");
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : "Error al actualizar local");
    } finally {
      setUpdatingLocal(false);
    }
  };

  const handlePublish = async () => {
    const ok = window.confirm("Va a subir codigo a git y sincronizar datos locales a produccion. Continuar?");
    if (!ok) return;

    setPublishing(true);
    setSyncStatus("Subiendo codigo a git...");
    try {
      const pushRes = await fetch("/api/git/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const pushData = await pushRes.json();
      if (!pushRes.ok) throw new Error(pushData?.details || pushData?.error || "Error en push git");

      setSyncStatus("Sincronizando datos locales a produccion...");
      const syncRes = await fetch("/api/data/sync-to-production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const syncData = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncData?.details || syncData?.error || "Error en sync local->prod");

      setSyncStatus("Publicado: codigo y datos en produccion");
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nn-bg)]">
      <Sidebar />
      <main className="px-5 pb-8 md:px-10 md:pr-[18rem]">
        <div className="mx-auto max-w-7xl space-y-7">
          <section className="overflow-hidden rounded-xl border border-[var(--nn-border)] bg-[var(--nn-true-blue)] px-6 py-7 text-[var(--nn-snow-white)] md:px-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--nn-snow-white)]/90">Vista General</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Dashboard financiero</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--nn-snow-white)]/90 md:text-base">Control diario de ingresos, egresos y balance anual con una visual de tendencia simple.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={handleUpdateLocal}
                disabled={updatingLocal || publishing}
                className="inline-flex w-fit items-center rounded-lg border border-[var(--nn-snow-white)]/40 bg-[var(--nn-snow-white)]/10 px-4 py-2 text-sm font-semibold text-[var(--nn-snow-white)] transition-colors hover:bg-[var(--nn-snow-white)]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updatingLocal ? "Actualizando..." : "Actualizar local"}
              </button>
              <button
                onClick={handlePublish}
                disabled={updatingLocal || publishing}
                className="inline-flex w-fit items-center rounded-lg border border-[var(--nn-snow-white)]/40 bg-[var(--nn-snow-white)]/10 px-4 py-2 text-sm font-semibold text-[var(--nn-snow-white)] transition-colors hover:bg-[var(--nn-snow-white)]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {publishing ? "Publicando..." : "Publicar a produccion"}
              </button>
              {syncStatus && <p className="text-xs text-[var(--nn-snow-white)]/80">{syncStatus}</p>}
            </div>
          </section>

          <DollarBanner
            onCotizacionChange={(value) => {
              setCotizacion(value);
              loadPatrimonio();
            }}
            onMonedaChange={setMoneda}
          />

          <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--nn-text-muted)]">Total Patrimonio (ARS)</p>
                <p className="mt-2 text-3xl font-bold text-[var(--nn-true-blue)]">
                  $ {patrimonioTotalPesos.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="mt-1 text-xs text-[var(--nn-text-muted)]">
                  Activos e inversiones + Cocos (ultima caucion) + dolares convertidos.
                </p>
              </div>
              {patrimonioData?.comparacion?.tiene_dato_ayer && (
                <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${Number(patrimonioData.comparacion.variacion_ars) >= 0 ? "bg-green-500/10 text-[#12945f]" : "bg-red-500/10 text-[#cf2f61]"}`}>
                  {Number(patrimonioData.comparacion.variacion_ars) >= 0 ? "+" : ""}
                  {formatMonto(Number(patrimonioData.comparacion.variacion_ars))} vs ayer
                </div>
              )}
            </div>
            {patrimonioError && <p className="mt-3 text-xs text-[#b42355]">{patrimonioError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Ahorro mensual</p>
              <p className={`mt-2 text-2xl font-bold ${getAhorroColor(ahorroMensualPct)}`}>
                {ahorroMensualPct === null ? "-" : `${ahorroMensualPct.toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Runway</p>
              <p className="mt-2 text-2xl font-bold text-[var(--nn-true-blue)]">
                {runwayMeses === null ? "-" : `${runwayMeses.toFixed(1)} meses`}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Concentracion USD</p>
              <p className="mt-2 text-2xl font-bold text-[var(--nn-true-blue)]">
                {patrimonioData?.concentracion ? `${patrimonioData.concentracion.dolares_pct.toFixed(1)}%` : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Concentracion caucion</p>
              <p className="mt-2 text-2xl font-bold text-[var(--nn-light-blue)]">
                {patrimonioData?.concentracion ? `${patrimonioData.concentracion.ultima_caucion_pct.toFixed(1)}%` : "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Score financiero</p>
              <p className={`mt-2 text-2xl font-bold ${getScoreColor(scoreFinanciero)}`}>
                {scoreFinanciero === null ? "-" : `${scoreFinanciero.toFixed(0)}/100`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Activos + inv. entidades</p>
              <p className="mt-2 text-xl font-bold text-[var(--nn-true-blue)]">{formatMonto(Number(patrimonioData?.breakdown?.activos_ars || 0))}</p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Cocos sin cauciones</p>
              <p className="mt-2 text-xl font-bold text-[var(--nn-true-blue)]">{formatMonto(Number(patrimonioData?.breakdown?.inversiones_cocos_sin_cauciones_ars || 0))}</p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Ultima caucion</p>
              <p className="mt-2 text-xl font-bold text-[var(--nn-true-blue)]">{formatMonto(Number(patrimonioData?.breakdown?.ultima_caucion_ars || 0))}</p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nn-text-muted)]">Dolares en ARS</p>
              <p className="mt-2 text-xl font-bold text-[var(--nn-true-blue)]">{formatMonto(Number(patrimonioData?.breakdown?.dolares_ars || 0))}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-[#eafaf0] p-3">
                  <TrendingUp className="text-[#12945f]" size={20} />
                </div>
                {diffIng !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${diffIng > 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                    {diffIng > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {Math.abs(diffIng).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-[var(--nn-text-muted)]">Ingresos del Mes</p>
              <p className="mt-2 text-3xl font-bold text-[#12945f]">{formatMonto(ingMesActual)}</p>
            </div>

            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-[#ffeef3] p-3">
                  <TrendingDown className="text-[#cf2f61]" size={20} />
                </div>
                {diffEgr !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${diffEgr < 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                    {diffEgr > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {Math.abs(diffEgr).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-[var(--nn-text-muted)]">Egresos del Mes</p>
              <p className="mt-2 text-3xl font-bold text-[#cf2f61]">{formatMonto(egrMesActual)}</p>
            </div>

            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-[var(--nn-primary-soft)] p-3">
                  <Wallet className="text-[var(--nn-true-blue)]" size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-[var(--nn-text-muted)]">Balance del Mes</p>
              <p className={`mt-2 text-3xl font-bold ${ingMesActual - egrMesActual >= 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                {formatMonto(ingMesActual - egrMesActual)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6">
              <p className="text-sm font-medium text-[var(--nn-text-muted)]">Total Ingresos {new Date().getFullYear()}</p>
              <p className="mt-2 text-2xl font-bold text-[#12945f]">{formatMonto(totalIngresosAnio)}</p>
            </div>
            <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6">
              <p className="text-sm font-medium text-[var(--nn-text-muted)]">Total Egresos {new Date().getFullYear()}</p>
              <p className="mt-2 text-2xl font-bold text-[#cf2f61]">{formatMonto(totalEgresosAnio)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] p-6 md:p-8">
            <h2 className="mb-8 text-xl font-bold text-[var(--nn-true-blue)]">Ingresos vs Egresos por Mes</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--nn-border)" />
                  <XAxis dataKey="name" stroke="var(--nn-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--nn-text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--nn-snow-white)",
                      border: "1px solid var(--nn-border)",
                      borderRadius: "8px",
                      color: "var(--nn-true-blue)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "var(--nn-text-muted)" }} />
                  <Bar dataKey="Ingresos" fill="#12945f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Egresos" fill="#cf2f61" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

