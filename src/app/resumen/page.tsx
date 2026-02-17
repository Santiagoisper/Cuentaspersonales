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
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState<ResumenMes[]>([]);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");

  useEffect(() => {
    fetch(`/api/resumen?anio=${anio}`)
      .then((r) => r.json())
      .then(setResumen)
      .catch(() => {});
  }, [anio]);

  const fmt = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
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
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Resumen General</h1>
            <p className="text-[#94a3b8]">Comparativa mensual de ingresos vs egresos</p>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          {/* Year selector */}
          <div className="flex items-center gap-4">
            <button onClick={() => setAnio(anio - 1)} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-xl font-bold text-white">{anio}</span>
            <button onClick={() => setAnio(anio + 1)} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
              <p className="text-sm text-[#94a3b8]">Total Ingresos {anio}</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{fmt(totalIng)}</p>
            </div>
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
              <p className="text-sm text-[#94a3b8]">Total Egresos {anio}</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalEgr)}</p>
            </div>
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
              <p className="text-sm text-[#94a3b8]">Balance {anio}</p>
              <p className={`text-2xl font-bold mt-1 ${totalDiff >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(totalDiff)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#94a3b8]">Mes</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#94a3b8]">Ingresos</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#94a3b8]">Egresos</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#94a3b8]">Diferencia</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-[#94a3b8]">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {resumen.map((r) => (
                    <tr key={r.mes} className="hover:bg-[#334155]/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{MESES[r.mes - 1]}</td>
                      <td className="px-6 py-4 text-right text-green-400 font-medium">{fmt(r.ingresos)}</td>
                      <td className="px-6 py-4 text-right text-red-400 font-medium">{fmt(r.egresos)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${r.diferencia >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {fmt(r.diferencia)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.diferencia > 0 ? (
                          <TrendingUp className="inline text-green-400" size={18} />
                        ) : r.diferencia < 0 ? (
                          <TrendingDown className="inline text-red-400" size={18} />
                        ) : (
                          <Minus className="inline text-[#64748b]" size={18} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#475569] bg-[#0f172a]/50">
                    <td className="px-6 py-4 font-bold text-white">TOTAL</td>
                    <td className="px-6 py-4 text-right font-bold text-green-400">{fmt(totalIng)}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-400">{fmt(totalEgr)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${totalDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {fmt(totalDiff)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Balance Mensual</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
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
