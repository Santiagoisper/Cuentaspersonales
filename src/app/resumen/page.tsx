"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import DollarBanner from "@/components/DollarBanner";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ResumenMes {
  mes: number;
  ingresos: number;
  egresos: number;
  diferencia: number;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function ResumenPage() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenMes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/resumen?anio=${anio}`)
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
  }, [anio]);

  const fmt = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nn-bg)]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--nn-true-blue)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--nn-bg)]">
        <Sidebar />
        <main className="p-5 md:p-10 md:pr-[18rem]">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[var(--nn-snow-white)] border border-[var(--nn-border-strong)] rounded-xl p-6">
              <h1 className="text-xl font-bold text-[var(--nn-true-blue)] mb-2">Error al cargar el resumen</h1>
              <p className="text-[#c83467]">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalIng = resumen.reduce((s, r) => s + r.ingresos, 0);
  const totalEgr = resumen.reduce((s, r) => s + r.egresos, 0);
  const totalDiff = totalIng - totalEgr;

  const chartData = resumen.map((r) => ({
    name: MESES[r.mes - 1].substring(0, 3),
    Diferencia: moneda === "USD" ? Math.round(r.diferencia / cotizacion) : r.diferencia,
  }));

  return (
    <div className="min-h-screen bg-[var(--nn-bg)]">
      <Sidebar />
      <main className="p-5 md:p-10 md:pr-[18rem]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--nn-true-blue)]">Resumen General</h1>
            <p className="text-[var(--nn-text-muted)]">Comparativa mensual de ingresos vs egresos</p>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          <div className="flex items-center gap-4">
            <button onClick={() => setAnio(anio - 1)} className="p-2 rounded-lg bg-[var(--nn-snow-white)] border border-[var(--nn-border)] hover:bg-[var(--nn-primary-soft)] transition-colors text-[var(--nn-true-blue)]">
              <ChevronLeft size={18} />
            </button>
            <span className="text-xl font-bold text-[var(--nn-true-blue)]">{anio}</span>
            <button onClick={() => setAnio(anio + 1)} className="p-2 rounded-lg bg-[var(--nn-snow-white)] border border-[var(--nn-border)] hover:bg-[var(--nn-primary-soft)] transition-colors text-[var(--nn-true-blue)]">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-5">
              <p className="text-sm text-[var(--nn-text-muted)]">Total Ingresos {anio}</p>
              <p className="text-2xl font-bold text-[#12945f] mt-1">{fmt(totalIng)}</p>
            </div>
            <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-5">
              <p className="text-sm text-[var(--nn-text-muted)]">Total Egresos {anio}</p>
              <p className="text-2xl font-bold text-[#cf2f61] mt-1">{fmt(totalEgr)}</p>
            </div>
            <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-5">
              <p className="text-sm text-[var(--nn-text-muted)]">Balance {anio}</p>
              <p className={`text-2xl font-bold mt-1 ${totalDiff >= 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>{fmt(totalDiff)}</p>
            </div>
          </div>

          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--nn-border)] bg-[var(--nn-bg)]">
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--nn-text-muted)]">Mes</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[var(--nn-text-muted)]">Ingresos</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[var(--nn-text-muted)]">Egresos</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[var(--nn-text-muted)]">Diferencia</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-[var(--nn-text-muted)]">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nn-border)]">
                  {resumen.map((r) => (
                    <tr key={r.mes} className="hover:bg-[var(--nn-bg)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--nn-true-blue)]">{MESES[r.mes - 1]}</td>
                      <td className="px-6 py-4 text-right text-[#12945f] font-medium">{fmt(r.ingresos)}</td>
                      <td className="px-6 py-4 text-right text-[#cf2f61] font-medium">{fmt(r.egresos)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${r.diferencia >= 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                        {fmt(r.diferencia)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.diferencia > 0 ? (
                          <TrendingUp className="inline text-[#12945f]" size={18} />
                        ) : r.diferencia < 0 ? (
                          <TrendingDown className="inline text-[#cf2f61]" size={18} />
                        ) : (
                          <Minus className="inline text-[var(--nn-text-muted)]" size={18} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--nn-border)] bg-[var(--nn-bg)]">
                    <td className="px-6 py-4 font-bold text-[var(--nn-true-blue)]">TOTAL</td>
                    <td className="px-6 py-4 text-right font-bold text-[#12945f]">{fmt(totalIng)}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#cf2f61]">{fmt(totalEgr)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${totalDiff >= 0 ? "text-[#12945f]" : "text-[#cf2f61]"}`}>
                      {fmt(totalDiff)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--nn-true-blue)] mb-6">Balance Mensual</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
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
                  <Area
                    type="monotone"
                    dataKey="Diferencia"
                    stroke="var(--nn-true-blue)"
                    fill="var(--nn-primary-soft)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




