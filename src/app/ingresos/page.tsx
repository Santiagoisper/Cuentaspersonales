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
  const [loading, setLoading] = useState(false);
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
      .then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then(setIngresos)
      .catch(() => setIngresos([]));

    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAnio = mes === 1 ? anio - 1 : anio;
    fetch(`/api/ingresos?anio=${prevAnio}&mes=${prevMes}`)
      .then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then(setIngresosPrev)
      .catch(() => setIngresosPrev([]));
  }, [anio, mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!confirm("Â¿Eliminar este ingreso?")) return;
    await fetch("/api/ingresos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const total = ingresos.reduce((s, e) => s + Number(e.monto), 0);
  const totalPrev = ingresosPrev.reduce((s, e) => s + Number(e.monto), 0);
  const diff = totalPrev > 0 ? ((total - totalPrev) / totalPrev * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <Sidebar />
      <main className="lg:ml-72 p-5 pt-20 lg:p-10 lg:pt-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2a66]">Ingresos</h1>
              <p className="text-[#5a6f99]">Ingresos mensuales por categorÃ­a</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f9b62] hover:bg-[#0b7f50] text-white font-medium transition-colors"
            >
              <Plus size={18} /> Agregar
            </button>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <MonthSelector mes={mes} anio={anio} onChange={(m, a) => { setMes(m); setAnio(a); }} />
            <div className="bg-white rounded-xl border border-[#d7e4ff] px-6 py-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-[#5a6f99]">Total del Mes</p>
                  <p className="text-xl font-bold text-green-400">{formatMonto(total)}</p>
                </div>
                {diff !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${diff > 0 ? "text-green-400" : "text-red-400"}`}>
                    {diff > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(diff).toFixed(1)}% vs mes anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Income table */}
          <div className="bg-white rounded-xl border border-[#d7e4ff] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d7e4ff]">
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#5a6f99]">CategorÃ­a</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#5a6f99]">Monto</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-[#5a6f99]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5edff]">
                  {CATEGORIAS_INGRESO.map((cat) => {
                    const item = ingresos.find((i) => i.categoria === cat);
                    return (
                      <tr key={cat} className="hover:bg-[#eef4ff]/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-[#0a2a66]">{cat}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-medium ${item ? "text-green-400" : "text-[#7a8fb8]"}`}>
                            {item ? formatMonto(Number(item.monto)) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item ? (
                              <>
                                <button onClick={() => openEdit(item)} className="text-[#7a8fb8] hover:text-blue-400 transition-colors">
                                  <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-[#7a8fb8] hover:text-red-400 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditItem(null);
                                  setFormCat(cat);
                                  setFormMonto("");
                                  setModalOpen(true);
                                }}
                                className="text-[#7a8fb8] hover:text-green-400 transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#c9dbff]">
                    <td className="px-6 py-4 font-bold text-[#0a2a66]">TOTAL</td>
                    <td className="px-6 py-4 text-right font-bold text-green-400">{formatMonto(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Modal */}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Ingreso" : "Agregar Ingreso"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">CategorÃ­a</label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value)}
                  className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]"
                >
                  {CATEGORIAS_INGRESO.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">Monto</label>
                <input
                  type="number"
                  value={formMonto}
                  onChange={(e) => setFormMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 rounded-lg bg-[#0f9b62] hover:bg-[#0b7f50] text-white font-medium transition-colors"
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


