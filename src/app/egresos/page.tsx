"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DollarBanner from "@/components/DollarBanner";
import MonthSelector from "@/components/MonthSelector";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Egreso {
  id: number;
  anio: number;
  mes: number;
  categoria: string;
  subcategoria: string;
  monto: number;
}

const CATEGORIAS: Record<string, string[]> = {
  "Vivienda": ["Expensas Velvet"],
  "Educación": ["Pestalozzi", "Uni. de San Andrés"],
  "Tarjetas": ["Amex", "Visa Galicia", "Master Galicia", "Tarjeta ML"],
  "Servicios": ["Edenor", "Movistar", "Ipan", "Otros"],
  "Personales": ["Monotributo"],
  "Vehículos": ["Patente Moto", "Patente Auto"],
  "Limpieza": ["Norma"],
};

const CAT_COLORS: Record<string, string> = {
  "Vivienda": "bg-blue-500/20 text-blue-400",
  "Educación": "bg-purple-500/20 text-purple-400",
  "Tarjetas": "bg-yellow-500/20 text-yellow-400",
  "Servicios": "bg-cyan-500/20 text-cyan-400",
  "Personales": "bg-pink-500/20 text-pink-400",
  "Vehículos": "bg-orange-500/20 text-orange-400",
  "Limpieza": "bg-green-500/20 text-green-400",
};

export default function EgresosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [egresosPrev, setEgresosPrev] = useState<Egreso[]>([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Egreso | null>(null);
  const [formCat, setFormCat] = useState("");
  const [formSubcat, setFormSubcat] = useState("");
  const [formMonto, setFormMonto] = useState("");

  useEffect(() => {
    fetch("/api/auth/verify").then((r) => {
      if (!r.ok) router.push("/");
      else setLoading(false);
    });
  }, [router]);

  const fetchData = useCallback(() => {
    fetch(`/api/egresos?anio=${anio}&mes=${mes}`)
      .then((r) => r.json())
      .then((data) => setEgresos(data))
      .catch(() => {});

    // Fetch previous month
    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAnio = mes === 1 ? anio - 1 : anio;
    fetch(`/api/egresos?anio=${prevAnio}&mes=${prevMes}`)
      .then((r) => r.json())
      .then((data) => setEgresosPrev(data))
      .catch(() => {});
  }, [anio, mes]);

  useEffect(() => {
    if (!loading) fetchData();
  }, [loading, fetchData]);

  const handleMonthChange = (m: number, a: number) => {
    setMes(m);
    setAnio(a);
  };

  const formatMonto = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const openAdd = () => {
    setEditItem(null);
    setFormCat(Object.keys(CATEGORIAS)[0]);
    setFormSubcat(CATEGORIAS[Object.keys(CATEGORIAS)[0]][0]);
    setFormMonto("");
    setModalOpen(true);
  };

  const openEdit = (item: Egreso) => {
    setEditItem(item);
    setFormCat(item.categoria);
    setFormSubcat(item.subcategoria);
    setFormMonto(String(item.monto));
    setModalOpen(true);
  };

  const handleSave = async () => {
    await fetch("/api/egresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anio,
        mes,
        categoria: formCat,
        subcategoria: formSubcat,
        monto: Number(formMonto) || 0,
      }),
    });
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este egreso?")) return;
    await fetch("/api/egresos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const total = egresos.reduce((s, e) => s + Number(e.monto), 0);
  const totalPrev = egresosPrev.reduce((s, e) => s + Number(e.monto), 0);
  const diff = totalPrev > 0 ? ((total - totalPrev) / totalPrev * 100) : 0;

  // Group by category
  const grouped: Record<string, Egreso[]> = {};
  egresos.forEach((e) => {
    if (!grouped[e.categoria]) grouped[e.categoria] = [];
    grouped[e.categoria].push(e);
  });

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="lg:ml-64 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Egresos</h1>
              <p className="text-[#94a3b8]">Gastos mensuales por categoría</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <Plus size={18} /> Agregar
            </button>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <MonthSelector mes={mes} anio={anio} onChange={handleMonthChange} />
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] px-6 py-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-[#94a3b8]">Total del Mes</p>
                  <p className="text-xl font-bold text-red-400">{formatMonto(total)}</p>
                </div>
                {diff !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${diff < 0 ? "text-green-400" : "text-red-400"}`}>
                    {diff > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(diff).toFixed(1)}% vs mes anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            {Object.entries(CATEGORIAS).map(([cat]) => {
              const items = grouped[cat] || [];
              const catTotal = items.reduce((s, e) => s + Number(e.monto), 0);
              const colorClass = CAT_COLORS[cat] || "bg-gray-500/20 text-gray-400";

              return (
                <div key={cat} className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-[#334155]">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{cat}</span>
                    </div>
                    <span className="font-bold text-white">{formatMonto(catTotal)}</span>
                  </div>
                  {items.length > 0 ? (
                    <div className="divide-y divide-[#334155]">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#334155]/30 transition-colors">
                          <span className="text-[#94a3b8]">{item.subcategoria}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">{formatMonto(Number(item.monto))}</span>
                            <button onClick={() => openEdit(item)} className="text-[#64748b] hover:text-blue-400 transition-colors">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-[#64748b] hover:text-red-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-sm text-[#64748b]">Sin gastos registrados</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal */}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Egreso" : "Agregar Egreso"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Categoría</label>
                <select
                  value={formCat}
                  onChange={(e) => {
                    setFormCat(e.target.value);
                    setFormSubcat(CATEGORIAS[e.target.value]?.[0] || "");
                  }}
                  className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-white"
                >
                  {Object.keys(CATEGORIAS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Subcategoría</label>
                <select
                  value={formSubcat}
                  onChange={(e) => setFormSubcat(e.target.value)}
                  className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-white"
                >
                  {(CATEGORIAS[formCat] || []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Monto</label>
                <input
                  type="number"
                  value={formMonto}
                  onChange={(e) => setFormMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              >
                {editItem ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
