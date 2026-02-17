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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7faff] via-[#f5f9ff] to-[#eef4ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7faff] via-[#f5f9ff] to-[#eef4ff]">
        <Sidebar />
        <main className="p-5 pt-24 sm:pt-20 md:p-10 md:pt-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-red-500/30 rounded-xl p-6">
              <h1 className="text-xl font-bold text-[#0d2a5f] mb-2">Error al cargar el resumen</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-[#f7faff] via-[#f5f9ff] to-[#eef4ff]">
      <Sidebar />
      <main className="p-5 pt-24 sm:pt-20 md:p-10 md:pt-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0d2a5f]">Resumen General</h1>
            <p className="text-[#5f769d]">Comparativa mensual de ingresos vs egresos</p>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          {/* Year selector */}
          <div className="flex items-center gap-4">
            <button onClick={() => setAnio(anio - 1)} className="p-2 rounded-lg bg-[#f5f8ff] hover:bg-[#dbe8ff] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-xl font-bold text-[#0d2a5f]">{anio}</span>
            <button onClick={() => setAnio(anio + 1)} className="p-2 rounded-lg bg-[#f5f8ff] hover:bg-[#dbe8ff] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#d6e2f4] p-5">
              <p className="text-sm text-[#5f769d]">Total Ingresos {anio}</p>
              <p className="text-2xl font-bold text-[#10b981] mt-1">{fmt(totalIng)}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#d6e2f4] p-5">
              <p className="text-sm text-[#5f769d]">Total Egresos {anio}</p>
              <p className="text-2xl font-bold text-[#ef4444] mt-1">{fmt(totalEgr)}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#d6e2f4] p-5">
              <p className="text-sm text-[#5f769d]">Balance {anio}</p>
              <p className={`text-2xl font-bold mt-1 ${totalDiff >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>{fmt(totalDiff)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#d6e2f4] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d6e2f4]">
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#5f769d]">Mes</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#5f769d]">Ingresos</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#5f769d]">Egresos</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#5f769d]">Diferencia</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-[#5f769d]">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1eaf7]">
                  {resumen.map((r) => (
                    <tr key={r.mes} className="hover:bg-[#f5f8ff]/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#0d2a5f]">{MESES[r.mes - 1]}</td>
                      <td className="px-6 py-4 text-right text-[#10b981] font-medium">{fmt(r.ingresos)}</td>
                      <td className="px-6 py-4 text-right text-[#ef4444] font-medium">{fmt(r.egresos)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${r.diferencia >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {fmt(r.diferencia)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.diferencia > 0 ? (
                          <TrendingUp className="inline text-[#10b981]" size={18} />
                        ) : r.diferencia < 0 ? (
                          <TrendingDown className="inline text-[#ef4444]" size={18} />
                        ) : (
                          <Minus className="inline text-[#6b84ac]" size={18} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#d2deef] bg-gradient-to-br from-[#f7faff] via-[#f5f9ff] to-[#eef4ff]/50">
                    <td className="px-6 py-4 font-bold text-[#0d2a5f]">TOTAL</td>
                    <td className="px-6 py-4 text-right font-bold text-[#10b981]">{fmt(totalIng)}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#ef4444]">{fmt(totalEgr)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${totalDiff >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                      {fmt(totalDiff)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-[#d6e2f4] p-6">
            <h2 className="text-lg font-semibold text-[#0d2a5f] mb-6">Balance Mensual</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e4ff" />
                  <XAxis dataKey="name" stroke="#5a6f99" fontSize={12} />
                  <YAxis stroke="#5a6f99" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d7e4ff",
                      borderRadius: "8px",
                      color: "#0a2a66",
                    }}
                  />
                  <defs>
                    <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="Diferencia"
                    stroke="#3b82f6"
                    fill="url(#colorDiff)"
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



