"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenMes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");
  const [gitLoading, setGitLoading] = useState(false);
  const [gitStatus, setGitStatus] = useState<string | null>(null);

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
  }, []);

  const formatMonto = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f9ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-2 border-[#1652c4] border-t-transparent" />
          <p className="text-sm text-[#5f769d]">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f9ff]">
        <Sidebar />
        <main className="px-5 pb-8 pt-24 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-[#f1c0cf] bg-white p-6 shadow-[0_16px_34px_rgba(40,72,130,0.09)]">
              <h1 className="mb-2 text-xl font-bold text-[#0d2a5f]">Error al cargar el dashboard</h1>
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

  const handleGitPush = async () => {
    setGitLoading(true);
    setGitStatus(null);
    try {
      const res = await fetch("/api/git/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || "Error al subir al git");
      setGitStatus(`${data?.message || "Listo"} (${data?.branch || "main"})`);
    } catch (err) {
      setGitStatus(err instanceof Error ? err.message : "Error al subir al git");
    } finally {
      setGitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      <Sidebar />
      <main className="px-5 pb-8 pt-24 md:px-10">
        <div className="mx-auto max-w-7xl space-y-7">
          <section className="relative overflow-hidden rounded-[28px] border border-[#d5e1f4] bg-gradient-to-r from-[#0d2a5f] to-[#1757ca] px-6 py-7 text-white shadow-[0_24px_50px_rgba(18,58,130,0.35)] md:px-9">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            <p className="text-[11px] uppercase tracking-[0.22em] text-blue-100">Vista General</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Dashboard financiero</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">Control diario de ingresos, egresos y balance anual con una visual de tendencia simple.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={handleGitPush}
                disabled={gitLoading}
                className="inline-flex w-fit items-center rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {gitLoading ? "Subiendo..." : "Subir al git"}
              </button>
              {gitStatus && <p className="text-xs text-blue-100">{gitStatus}</p>}
            </div>
          </section>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#d5e8dc] bg-white p-6 shadow-[0_10px_28px_rgba(23,66,133,0.07)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-[#eafaf0] p-3">
                  <TrendingUp className="text-[#12945f]" size={20} />
                </div>
                {diffIng !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${diffIng > 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                    {diffIng > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {Math.abs(diffIng).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-[#6078a0]">Ingresos del Mes</p>
              <p className="mt-2 text-3xl font-bold text-[#12945f]">{formatMonto(ingMesActual)}</p>
            </div>

            <div className="rounded-2xl border border-[#f0d8e1] bg-white p-6 shadow-[0_10px_28px_rgba(23,66,133,0.07)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-[#ffeef3] p-3">
                  <TrendingDown className="text-[#cf2f61]" size={20} />
                </div>
                {diffEgr !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${diffEgr < 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                    {diffEgr > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {Math.abs(diffEgr).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-[#6078a0]">Egresos del Mes</p>
              <p className="mt-2 text-3xl font-bold text-[#cf2f61]">{formatMonto(egrMesActual)}</p>
            </div>

            <div className="rounded-2xl border border-[#d8e4f5] bg-white p-6 shadow-[0_10px_28px_rgba(23,66,133,0.07)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-[#eaf1ff] p-3">
                  <Wallet className="text-[#1652c4]" size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-[#6078a0]">Balance del Mes</p>
              <p className={`mt-2 text-3xl font-bold ${ingMesActual - egrMesActual >= 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                {formatMonto(ingMesActual - egrMesActual)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#dce8f7] bg-white p-6 shadow-[0_10px_28px_rgba(23,66,133,0.07)]">
              <p className="text-sm font-medium text-[#6078a0]">Total Ingresos {new Date().getFullYear()}</p>
              <p className="mt-2 text-2xl font-bold text-[#12945f]">{formatMonto(totalIngresosAnio)}</p>
            </div>
            <div className="rounded-2xl border border-[#dce8f7] bg-white p-6 shadow-[0_10px_28px_rgba(23,66,133,0.07)]">
              <p className="text-sm font-medium text-[#6078a0]">Total Egresos {new Date().getFullYear()}</p>
              <p className="mt-2 text-2xl font-bold text-[#cf2f61]">{formatMonto(totalEgresosAnio)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d6e2f4] bg-white p-6 shadow-[0_14px_30px_rgba(23,66,133,0.08)] md:p-8">
            <h2 className="mb-8 text-xl font-bold text-[#0d2a5f]">Ingresos vs Egresos por Mes</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dce6f6" />
                  <XAxis dataKey="name" stroke="#5c779f" fontSize={12} />
                  <YAxis stroke="#5c779f" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #cfdbef",
                      borderRadius: "10px",
                      color: "#0d2a5f",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#5c779f" }} />
                  <Bar dataKey="Ingresos" fill="#1ba36a" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Egresos" fill="#d73c6c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
