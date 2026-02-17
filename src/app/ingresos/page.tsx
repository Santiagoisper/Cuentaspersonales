"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DollarBanner from "@/components/DollarBanner";
import MonthSelector from "@/components/MonthSelector";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Ingreso {
  id: number;
  anio: number;
  mes: number;
  categoria: string;
  monto: number;
}

const CATEGORIAS_INGRESO = [
  "Locales",
  "Cinme Sueldo",
  "Cinme 2",
  "Ventas U$S",
  "Otros",
  "SAC",
];

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [ingresosPrev, setIngresosPrev] = useState<Ingreso[]>([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Ingreso | null>(null);
  const [formCat, setFormCat] = useState("");
  const [formMonto, setFormMonto] = useState("");

  const fetchData = useCallback(() => {
    fetch(`/api/ingresos?anio=${anio}&mes=${mes}`)
      .then(async (r) => { const d = await r.json(); return Array.isArray(d) ? d : []; })
      .then(setIngresos)
      .catch(() => setIngresos([]));

    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAnio = mes === 1 ? anio - 1 : anio;
    fetch(`/api/ingresos?anio=${prevAnio}&mes=${prevMes}`)
      .then(async (r) => { const d = await r.json(); return Array.isArray(d) ? d : []; })
      .then(setIngresosPrev)
      .catch(() => setIngresosPrev([]));
  }, [anio, mes]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatMonto = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const openAdd = () => {
    setEditItem(null);
    setFormCat(CATEGORIAS_INGRESO[0]);
    setFormMonto("");
    setModalOpen(true);
  };

  const openEdit = (item: Ingreso) => {
    setEditItem(item);
    setFormCat(item.categoria);
    setFormMonto(String(item.monto));
    setModalOpen(true);
  };

  const handleSave = async () => {
    await fetch("/api/ingresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editItem?.id,
        anio,
        mes,
        categoria: formCat,
        monto: Number(formMonto) || 0,
      }),
    });
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este ingreso?")) return;
    await fetch("/api/ingresos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const total = ingresos.reduce((s, e) => s + Number(e.monto), 0);
  const totalPrev = ingresosPrev.reduce((s, e) => s + Number(e.monto), 0);
  const diff = totalPrev > 0 ? ((total - totalPrev) / totalPrev * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      <Sidebar />

      <main className="pt-[69px]">
        {/* Page header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#1652c4] uppercase tracking-widest mb-1">Finanzas</p>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ingresos</h1>
                <p className="text-gray-500 mt-1 text-sm">Ingresos mensuales por fuente</p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1652c4] hover:bg-[#0f3c92] text-white text-sm font-semibold transition-colors rounded-sm"
              >
                <Plus size={16} />
                Agregar ingreso
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-6">
          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          {/* Month selector + summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <MonthSelector mes={mes} anio={anio} onChange={(m, a) => { setMes(m); setAnio(a); }} />
            <div className="bg-white border border-gray-200 rounded-sm px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total del mes</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-2xl font-bold text-gray-900">{formatMonto(total)}</span>
                {diff !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-sm ${
                    diff > 0 ? "bg-green-50 text-green-700" : "bg-[#eaf1ff] text-[#1652c4]"
                  }`}>
                    {diff > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(diff).toFixed(1)}% vs mes anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Income table */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Categoría</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Monto</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CATEGORIAS_INGRESO.map((cat) => {
                    const item = ingresos.find((i) => i.categoria === cat);
                    return (
                      <tr key={cat} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{cat}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold ${item ? "text-green-700" : "text-gray-400"}`}>
                            {item ? formatMonto(Number(item.monto)) : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100">
                            {item ? (
                              <>
                                <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-[#1652c4] transition-colors">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-[#1652c4] transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => { setEditItem(null); setFormCat(cat); setFormMonto(""); setModalOpen(true); }}
                                className="p-1.5 text-gray-400 hover:text-green-700 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-widest">Total</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-700">{formatMonto(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#1652c4] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(22,82,196,0.38)] transition-colors hover:bg-[#0f3c92]"
      >
        <Plus size={16} />
        Agregar ingreso
      </button>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Ingreso" : "Nuevo Ingreso"}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">Categoría</label>
            <select
              value={formCat}
              onChange={(e) => setFormCat(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#1652c4]"
            >
              {CATEGORIAS_INGRESO.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">Monto (ARS)</label>
            <input
              type="number"
              value={formMonto}
              onChange={(e) => setFormMonto(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#1652c4]"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#1652c4] hover:bg-[#0f3c92] text-white text-sm font-semibold transition-colors rounded-sm mt-2"
          >
            {editItem ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

