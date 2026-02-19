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
    if (!confirm("Eliminar este ingreso?")) return;
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
    <div className="min-h-screen bg-[var(--nn-bg)]">
      <Sidebar />

      <main className="md:pr-[18rem]">
        <div className="border-b border-[var(--nn-border)] bg-[var(--nn-snow-white)]">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-1">Finanzas</p>
                <h1 className="text-3xl font-bold text-[var(--nn-true-blue)] tracking-tight">Ingresos</h1>
                <p className="text-[var(--nn-text-muted)] mt-1 text-sm">Ingresos mensuales por fuente</p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-[var(--nn-snow-white)] text-sm font-semibold transition-colors rounded-lg"
              >
                <Plus size={16} />
                Agregar ingreso
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-6">
          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <MonthSelector mes={mes} anio={anio} onChange={(m, a) => { setMes(m); setAnio(a); }} />
            <div className="bg-[var(--nn-snow-white)] border border-[var(--nn-border)] rounded-xl px-6 py-4">
              <p className="text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest">Total del mes</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-2xl font-bold text-[var(--nn-true-blue)]">{formatMonto(total)}</span>
                {diff !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                    diff > 0 ? "bg-green-500/10 text-[#12945f]" : "bg-[var(--nn-primary-soft)] text-[var(--nn-true-blue)]"
                  }`}>
                    {diff > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(diff).toFixed(1)}% vs mes anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--nn-snow-white)] border border-[var(--nn-border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--nn-border)] bg-[var(--nn-bg)]">
                    <th className="px-6 py-4 text-left text-xs font-bold text-[var(--nn-text-muted)] uppercase tracking-widest">Categoria</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[var(--nn-text-muted)] uppercase tracking-widest">Monto</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[var(--nn-text-muted)] uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nn-border)]">
                  {CATEGORIAS_INGRESO.map((cat) => {
                    const item = ingresos.find((i) => i.categoria === cat);
                    return (
                      <tr key={cat} className="hover:bg-[var(--nn-bg)] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-[var(--nn-true-blue)]">{cat}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold ${item ? "text-[#12945f]" : "text-[var(--nn-text-muted)]"}`}>
                            {item ? formatMonto(Number(item.monto)) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100">
                            {item ? (
                              <>
                                <button onClick={() => openEdit(item)} className="p-1.5 text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)] transition-colors">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)] transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => { setEditItem(null); setFormCat(cat); setFormMonto(""); setModalOpen(true); }}
                                className="p-1.5 text-[var(--nn-text-muted)] hover:text-[#12945f] transition-colors"
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
                  <tr className="border-t-2 border-[var(--nn-border)] bg-[var(--nn-bg)]">
                    <td className="px-6 py-4 text-xs font-bold text-[var(--nn-true-blue)] uppercase tracking-widest">Total</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#12945f]">{formatMonto(total)}</td>
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[var(--nn-true-blue)] px-5 py-3 text-sm font-semibold text-[var(--nn-snow-white)] transition-colors hover:bg-[var(--nn-true-blue-hover)] md:right-[18.5rem]"
      >
        <Plus size={16} />
        Agregar ingreso
      </button>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Ingreso" : "Nuevo Ingreso"}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-2">Categoria</label>
            <select
              value={formCat}
              onChange={(e) => setFormCat(e.target.value)}
              className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
            >
              {CATEGORIAS_INGRESO.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-2">Monto (ARS)</label>
            <input
              type="number"
              value={formMonto}
              onChange={(e) => setFormMonto(e.target.value)}
              placeholder="0"
              className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-[var(--nn-snow-white)] text-sm font-semibold transition-colors rounded-lg mt-2"
          >
            {editItem ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}


