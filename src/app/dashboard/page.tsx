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
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f8ff]">
        <Sidebar />
        <main className="lg:ml-72 p-5 pt-20 lg:p-10 lg:pt-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-red-500/30 rounded-xl p-6">
              <h1 className="text-xl font-bold text-[#0a2a66] mb-2">Error al cargar el dashboard</h1>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const mesActual = new Date().getMonth(); // 0-indexed
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

  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <Sidebar />
      <main className="lg:ml-72 p-5 pt-20 lg:p-10 lg:pt-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2a66]">Dashboard</h1>
              <p className="text-[#5a6f99]">Resumen de tus finanzas</p>
            </div>
          </div>

          {/* Dollar Banner */}
          <DollarBanner
            onCotizacionChange={setCotizacion}
            onMonedaChange={setMoneda}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ingresos del Mes */}
            <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="text-green-400" size={20} />
                </div>
                {diffIng !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${diffIng > 0 ? "text-green-400" : "text-red-400"}`}>
                    {diffIng > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(diffIng).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-[#5a6f99] text-sm">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-[#0a2a66] mt-1">{formatMonto(ingMesActual)}</p>
            </div>

            {/* Egresos del Mes */}
            <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="text-red-400" size={20} />
                </div>
                {diffEgr !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${diffEgr < 0 ? "text-green-400" : "text-red-400"}`}>
                    {diffEgr > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(diffEgr).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-[#5a6f99] text-sm">Egresos del Mes</p>
              <p className="text-2xl font-bold text-[#0a2a66] mt-1">{formatMonto(egrMesActual)}</p>
            </div>

            {/* Balance */}
            <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Wallet className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-[#5a6f99] text-sm">Balance del Mes</p>
              <p className={`text-2xl font-bold mt-1 ${ingMesActual - egrMesActual >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatMonto(ingMesActual - egrMesActual)}
              </p>
            </div>
          </div>

          {/* Totals Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
              <p className="text-[#5a6f99] text-sm mb-1">Total Ingresos {new Date().getFullYear()}</p>
              <p className="text-xl font-bold text-green-400">{formatMonto(totalIngresosAnio)}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
              <p className="text-[#5a6f99] text-sm mb-1">Total Egresos {new Date().getFullYear()}</p>
              <p className="text-xl font-bold text-red-400">{formatMonto(totalEgresosAnio)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
            <h2 className="text-lg font-semibold text-[#0a2a66] mb-6">Ingresos vs Egresos por Mes</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart data={chartData}>
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
                  <Legend />
                  <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


