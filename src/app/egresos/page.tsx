"use client";

import { useEffect, useState, useCallback } from "react";
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
  Vivienda: ["Expensas Velvet"],
  Educacion: ["Pestalozzi", "Uni. de San Andres"],
  Tarjetas: ["Amex", "Visa Galicia", "Master Galicia", "Tarjeta ML"],
  Servicios: ["Edenor", "Movistar", "Ipan", "Otros"],
  Personales: ["Monotributo"],
  Vehiculos: ["Patente Moto", "Patente Auto"],
  Limpieza: ["Norma"],
};

const CAT_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  Vivienda: { dot: "bg-blue-600", text: "text-blue-700", bg: "bg-blue-50" },
  Educacion: { dot: "bg-purple-600", text: "text-purple-700", bg: "bg-purple-50" },
  Tarjetas: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  Servicios: { dot: "bg-cyan-600", text: "text-cyan-700", bg: "bg-cyan-50" },
  Personales: { dot: "bg-pink-600", text: "text-pink-700", bg: "bg-pink-50" },
  Vehiculos: { dot: "bg-orange-600", text: "text-orange-700", bg: "bg-orange-50" },
  Limpieza: { dot: "bg-green-600", text: "text-green-700", bg: "bg-green-50" },
};

const CUSTOM_CATEGORY_VALUE = "__custom_category__";
const CUSTOM_SUBCATEGORY_VALUE = "__custom_subcategory__";

export default function EgresosPage() {
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
  const [formCustomCat, setFormCustomCat] = useState("");
  const [formCustomSubcat, setFormCustomSubcat] = useState("");
  const [formMonto, setFormMonto] = useState("");

  const fetchData = useCallback(() => {
    fetch(`/api/egresos?anio=${anio}&mes=${mes}`)
      .then(async (r) => {
        const d = await r.json();
        return Array.isArray(d) ? d : [];
      })
      .then((d) => setEgresos(d))
      .catch(() => setEgresos([]));

    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAnio = mes === 1 ? anio - 1 : anio;
    fetch(`/api/egresos?anio=${prevAnio}&mes=${prevMes}`)
      .then(async (r) => {
        const d = await r.json();
        return Array.isArray(d) ? d : [];
      })
      .then((d) => setEgresosPrev(d))
      .catch(() => setEgresosPrev([]));
  }, [anio, mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    const firstCat = Object.keys(CATEGORIAS)[0];
    setFormCat(firstCat);
    setFormSubcat(CATEGORIAS[firstCat][0]);
    setFormCustomCat("");
    setFormCustomSubcat("");
    setFormMonto("");
    setModalOpen(true);
  };

  const openEdit = (item: Egreso) => {
    const baseCats = Object.keys(CATEGORIAS);
    const isCustomCat = !baseCats.includes(item.categoria);
    const baseSubcats = CATEGORIAS[item.categoria] || [];
    const isCustomSubcat = !isCustomCat && !baseSubcats.includes(item.subcategoria);

    setEditItem(item);
    setFormCat(isCustomCat ? CUSTOM_CATEGORY_VALUE : item.categoria);
    setFormSubcat(
      isCustomCat
        ? CUSTOM_SUBCATEGORY_VALUE
        : isCustomSubcat
          ? CUSTOM_SUBCATEGORY_VALUE
          : item.subcategoria
    );
    setFormCustomCat(isCustomCat ? item.categoria : "");
    setFormCustomSubcat(isCustomCat || isCustomSubcat ? item.subcategoria : "");
    setFormMonto(String(item.monto));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const categoriaToSave = formCat === CUSTOM_CATEGORY_VALUE ? formCustomCat.trim() : formCat;
    const subcategoriaToSave = formSubcat === CUSTOM_SUBCATEGORY_VALUE ? formCustomSubcat.trim() : formSubcat;

    if (!categoriaToSave || !subcategoriaToSave) {
      alert("Completa categoria y subcategoria.");
      return;
    }

    await fetch("/api/egresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editItem?.id,
        anio,
        mes,
        categoria: categoriaToSave,
        subcategoria: subcategoriaToSave,
        monto: Number(formMonto) || 0,
      }),
    });

    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este egreso?")) return;
    await fetch("/api/egresos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const total = egresos.reduce((s, e) => s + Number(e.monto), 0);
  const totalPrev = egresosPrev.reduce((s, e) => s + Number(e.monto), 0);
  const diff = totalPrev > 0 ? ((total - totalPrev) / totalPrev) * 100 : 0;

  const grouped: Record<string, Egreso[]> = {};
  egresos.forEach((e) => {
    if (!grouped[e.categoria]) grouped[e.categoria] = [];
    grouped[e.categoria].push(e);
  });

  const orderedCategories = [
    ...Object.keys(CATEGORIAS),
    ...Object.keys(grouped)
      .filter((cat) => !Object.prototype.hasOwnProperty.call(CATEGORIAS, cat))
      .sort((a, b) => a.localeCompare(b)),
  ];

  return (
    <div className="min-h-screen bg-[var(--nn-bg)]">
      <Sidebar />

      <main className="md:pr-[18rem]">
        <div className="border-b border-[var(--nn-border)] bg-[var(--nn-snow-white)]">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-1">Finanzas</p>
                <h1 className="text-3xl font-bold text-[var(--nn-true-blue)] tracking-tight">Egresos</h1>
                <p className="text-[var(--nn-text-muted)] mt-1 text-sm">Gastos mensuales organizados por categoria</p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-[var(--nn-snow-white)] text-sm font-semibold transition-colors rounded-lg"
              >
                <Plus size={16} />
                Agregar egreso
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-6">
          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <MonthSelector mes={mes} anio={anio} onChange={handleMonthChange} />

            <div className="bg-[var(--nn-snow-white)] border border-[var(--nn-border)] rounded-xl px-6 py-4">
              <p className="text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest">Total del mes</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-2xl font-bold text-[var(--nn-true-blue)]">{formatMonto(total)}</span>
                {diff !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                      diff < 0 ? "bg-green-500/10 text-[#12945f]" : "bg-[var(--nn-primary-soft)] text-[var(--nn-true-blue)]"
                    }`}
                  >
                    {diff > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(diff).toFixed(1)}% vs mes anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {orderedCategories.map((cat) => {
              const items = grouped[cat] || [];
              const catTotal = items.reduce((s, e) => s + Number(e.monto), 0);
              const colors = CAT_COLORS[cat] || { dot: "bg-[var(--nn-text-muted)]", text: "text-[var(--nn-true-blue)]", bg: "bg-[var(--nn-bg)]" };

              return (
                <div key={cat} className="bg-[var(--nn-snow-white)] border border-[var(--nn-border)] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nn-border)]">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                      <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
                        {cat}
                      </span>
                    </div>
                    <span className="font-bold text-[var(--nn-true-blue)] text-sm">{formatMonto(catTotal)}</span>
                  </div>

                  {items.length > 0 ? (
                    <div className="divide-y divide-[var(--nn-border)]">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-[var(--nn-bg)] transition-colors group">
                          <span className="text-sm text-[var(--nn-text-muted)]">{item.subcategoria}</span>
                          <div className="flex items-center gap-5">
                            <span className="text-sm font-semibold text-[var(--nn-true-blue)] min-w-[90px] text-right">
                              {formatMonto(Number(item.monto))}
                            </span>
                            <div className="flex items-center gap-2 opacity-100">
                              <button onClick={() => openEdit(item)} className="p-1.5 text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)] transition-colors">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)] transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-6 py-3.5 text-sm text-[var(--nn-text-muted)] italic">Sin gastos registrados</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[var(--nn-true-blue)] px-5 py-3 text-sm font-semibold text-[var(--nn-snow-white)] transition-colors hover:bg-[var(--nn-true-blue-hover)] md:right-[18.5rem]"
      >
        <Plus size={16} />
        Agregar egreso
      </button>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Egreso" : "Nuevo Egreso"}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-2">Categoria</label>
            <select
              value={formCat}
              onChange={(e) => {
                const value = e.target.value;
                setFormCat(value);
                setFormCustomCat("");
                setFormCustomSubcat("");
                if (value === CUSTOM_CATEGORY_VALUE) {
                  setFormSubcat(CUSTOM_SUBCATEGORY_VALUE);
                  return;
                }
                setFormSubcat(CATEGORIAS[value]?.[0] || CUSTOM_SUBCATEGORY_VALUE);
              }}
              className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
            >
              {Object.keys(CATEGORIAS).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={CUSTOM_CATEGORY_VALUE}>Otros (personalizado)</option>
            </select>
          </div>

          {formCat === CUSTOM_CATEGORY_VALUE && (
            <div>
              <label className="block text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-2">Nombre de categoria</label>
              <input
                type="text"
                value={formCustomCat}
                onChange={(e) => setFormCustomCat(e.target.value)}
                placeholder="Ej: Salud, Viajes, Regalos"
                className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-2">Subcategoria</label>
            {formCat === CUSTOM_CATEGORY_VALUE ? (
              <input
                type="text"
                value={formCustomSubcat}
                onChange={(e) => setFormCustomSubcat(e.target.value)}
                placeholder="Ej: Turnos, suscripcion, compras varias"
                className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
              />
            ) : (
              <select
                value={formSubcat}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormSubcat(value);
                  if (value !== CUSTOM_SUBCATEGORY_VALUE) setFormCustomSubcat("");
                }}
                className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
              >
                {(CATEGORIAS[formCat] || []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value={CUSTOM_SUBCATEGORY_VALUE}>Otros (escribir nombre)</option>
              </select>
            )}
          </div>

          {formCat !== CUSTOM_CATEGORY_VALUE && formSubcat === CUSTOM_SUBCATEGORY_VALUE && (
            <div>
              <label className="block text-xs font-semibold text-[var(--nn-text-muted)] uppercase tracking-widest mb-2">Nombre de subcategoria</label>
              <input
                type="text"
                value={formCustomSubcat}
                onChange={(e) => setFormCustomSubcat(e.target.value)}
                placeholder="Ej: Otro gasto de esta categoria"
                className="w-full border border-[var(--nn-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--nn-true-blue)] focus:outline-none focus:border-[var(--nn-true-blue)]"
              />
            </div>
          )}

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

