"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DollarBanner from "@/components/DollarBanner";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Activo {
  id: number;
  entidad: string;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

interface HistorialItem {
  fecha: string;
  total: number;
}

interface ComparacionPatrimonio {
  hoy_fecha: string;
  ayer_fecha: string;
  hoy_total_ars: number;
  ayer_total_ars: number;
  variacion_ars: number;
  variacion_pct: number | null;
  tiene_dato_ayer: boolean;
}

interface InversionCocos {
  id: number;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

const ENTIDADES = ["GALICIA", "EFECTIVO", "COCOS CAPITAL", "Otro"];
const TIPOS = ["activo", "inversion"];
const TIPOS_COCOS = ["CAUCIONES", "ACCIONES", "LETRAS", "Obligaciones Negociables", "BONOS", "Otros"];
const normalizeTipo = (value: string) => String(value || "").trim().toUpperCase();
const isCaucion = (value: string) => normalizeTipo(value) === "CAUCIONES";

export default function ActivosPage() {
  const [loading, setLoading] = useState(false);
  const [savingActivo, setSavingActivo] = useState(false);
  const [savingInv, setSavingInv] = useState(false);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [comparacion, setComparacion] = useState<ComparacionPatrimonio | null>(null);
  const [inversiones, setInversiones] = useState<InversionCocos[]>([]);
  const [cotizacion, setCotizacion] = useState(1000);
  const [moneda, setMoneda] = useState("ARS");

  // Activo modal
  const [modalActivo, setModalActivo] = useState(false);
  const [editActivo, setEditActivo] = useState<Activo | null>(null);
  const [fEntidad, setFEntidad] = useState("");
  const [fTipo, setFTipo] = useState("activo");
  const [fDesc, setFDesc] = useState("");
  const [fMonto, setFMonto] = useState("");

  // Inversion modal
  const [modalInv, setModalInv] = useState(false);
  const [editInv, setEditInv] = useState<InversionCocos | null>(null);
  const [fInvTipo, setFInvTipo] = useState("");
  const [fInvDesc, setFInvDesc] = useState("");
  const [fInvMonto, setFInvMonto] = useState("");
  const [fInvFecha, setFInvFecha] = useState("");

  const fetchData = useCallback(() => {
    fetch("/api/activos")
      .then(async (r) => {
        const data = await r.json();
        return data && typeof data === "object" ? data : { activos: [], historial: [], comparacion: null };
      })
      .then((data) => {
        setActivos(Array.isArray(data.activos) ? data.activos : []);
        setHistorial(Array.isArray(data.historial) ? data.historial : []);
        setComparacion(data.comparacion || null);
      })
      .catch(() => {
        setActivos([]);
        setHistorial([]);
        setComparacion(null);
      });

    fetch("/api/inversiones")
      .then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then(setInversiones)
      .catch(() => setInversiones([]));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fmt = (val: number) => {
    const display = moneda === "USD" ? val / cotizacion : val;
    const prefix = moneda === "USD" ? "U$S " : "$ ";
    return prefix + display.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Activo handlers
  const openAddActivo = () => {
    setEditActivo(null);
    setFEntidad(ENTIDADES[0]);
    setFTipo("activo");
    setFDesc("");
    setFMonto("");
    setModalActivo(true);
  };

  const openEditActivo = (a: Activo) => {
    setEditActivo(a);
    setFEntidad(a.entidad);
    setFTipo(a.tipo);
    setFDesc(a.descripcion);
    setFMonto(String(a.monto));
    setModalActivo(true);
  };

  const saveActivo = async (keepAdding = false) => {
    if (savingActivo) return;
    setSavingActivo(true);
    const method = editActivo ? "PUT" : "POST";
    const body = editActivo
      ? { id: editActivo.id, entidad: fEntidad, tipo: fTipo, descripcion: fDesc, monto: Number(fMonto) || 0 }
      : { entidad: fEntidad, tipo: fTipo, descripcion: fDesc, monto: Number(fMonto) || 0 };
    try {
      await fetch("/api/activos", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      fetchData();

      if (!editActivo && keepAdding) {
        setFDesc("");
        setFMonto("");
        return;
      }

      setModalActivo(false);
    } finally {
      setSavingActivo(false);
    }
  };

  const deleteActivo = async (id: number) => {
    if (!confirm("¿Eliminar este activo?")) return;
    await fetch("/api/activos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData();
  };

  // Inversion handlers
  const openAddInv = () => {
    setEditInv(null);
    setFInvTipo(TIPOS_COCOS[0]);
    setFInvDesc("");
    setFInvMonto("");
    setFInvFecha(new Date().toISOString().slice(0, 10));
    setModalInv(true);
  };

  const openEditInv = (i: InversionCocos) => {
    setEditInv(i);
    setFInvTipo(i.tipo);
    setFInvDesc(i.descripcion || "");
    setFInvMonto(String(i.monto));
    setFInvFecha(i.fecha ? String(i.fecha).slice(0, 10) : new Date().toISOString().slice(0, 10));
    setModalInv(true);
  };

  const saveInv = async () => {
    if (savingInv) return;
    setSavingInv(true);
    const method = editInv ? "PUT" : "POST";
    const body = editInv
      ? { id: editInv.id, tipo: fInvTipo, descripcion: fInvDesc, monto: Number(fInvMonto) || 0, fecha: fInvFecha }
      : { tipo: fInvTipo, descripcion: fInvDesc, monto: Number(fInvMonto) || 0, fecha: fInvFecha };
    try {
      await fetch("/api/inversiones", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setModalInv(false);
      fetchData();
    } finally {
      setSavingInv(false);
    }
  };

  const deleteInv = async (id: number) => {
    if (!confirm("¿Eliminar esta inversión?")) return;
    await fetch("/api/inversiones", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nn-bg)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const totalActivos = activos.reduce((s, a) => s + Number(a.monto), 0);
  const ultimaCaucion = inversiones
    .filter((i) => isCaucion(i.tipo))
    .reduce<InversionCocos | null>((latest, curr) => {
      if (!latest) return curr;
      const latestFecha = String(latest.fecha || "").slice(0, 10);
      const currFecha = String(curr.fecha || "").slice(0, 10);
      if (currFecha > latestFecha) return curr;
      if (currFecha < latestFecha) return latest;
      return curr.id > latest.id ? curr : latest;
    }, null);
  const totalInversiones = inversiones.reduce((s, i) => {
    if (isCaucion(i.tipo)) return s;
    return s + Number(i.monto);
  }, 0) + Number(ultimaCaucion?.monto || 0);
  const grandTotal = totalActivos + totalInversiones;

  const activosList = activos.filter((a) => a.tipo === "activo");
  const inversionesList = activos.filter((a) => a.tipo === "inversion");

  const chartData = [...historial].reverse().map((h) => ({
    fecha: new Date(h.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
    Total: moneda === "USD" ? Math.round(Number(h.total) / cotizacion) : Number(h.total),
  }));

  const dailyDiff = Number(comparacion?.variacion_ars || 0);

  const caucionesByDate: Record<string, number> = {};
  inversiones
    .filter((i) => isCaucion(i.tipo))
    .forEach((i) => {
      const fechaKey = String(i.fecha).slice(0, 10);
      caucionesByDate[fechaKey] = (caucionesByDate[fechaKey] || 0) + Number(i.monto);
    });

  const caucionesHistorial = Object.entries(caucionesByDate)
    .map(([fecha, monto]) => ({ fecha, monto }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const caucionesChartData = [...caucionesHistorial]
    .reverse()
    .map((d) => ({
      fecha: new Date(`${d.fecha}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
      Total: moneda === "USD" ? Number(d.monto) / cotizacion : Number(d.monto),
    }));

  const caucionesHoy = caucionesHistorial.length > 0 ? Number(caucionesHistorial[0].monto) : 0;
  const caucionesAyer = caucionesHistorial.length > 1 ? Number(caucionesHistorial[1].monto) : 0;
  const caucionesDiff = caucionesHoy - caucionesAyer;

  return (
    <div className="min-h-screen bg-[var(--nn-bg)]">
      <Sidebar />
      <main className="p-5 md:p-10 md:pr-[18rem]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--nn-true-blue)]">Activos & Inversiones</h1>
            <p className="text-[var(--nn-text-muted)]">Patrimonio y portafolio de inversiones</p>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          {/* Grand Total */}
          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-[var(--nn-text-muted)]">Total Patrimonio</p>
                <p className="text-3xl font-bold text-[var(--nn-true-blue)] mt-1">{fmt(grandTotal)}</p>
              </div>
              {comparacion?.tiene_dato_ayer && dailyDiff !== 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${dailyDiff > 0 ? "bg-green-500/10 text-[#10b981]" : "bg-red-500/10 text-[#ef4444]"}`}>
                  {dailyDiff > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  <span className="font-medium">{fmt(Math.abs(dailyDiff))} vs ayer</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical chart */}
          {chartData.length > 1 && (
            <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--nn-true-blue)] mb-4">Evolución del Patrimonio</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d7e4ff" />
                    <XAxis dataKey="fecha" stroke="#5a6f99" fontSize={11} />
                    <YAxis stroke="#5a6f99" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #d7e4ff", borderRadius: "8px", color: "#0a2a66" }} />
                    <Line type="monotone" dataKey="Total" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Activos Section */}
          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--nn-border)]">
              <h2 className="text-lg font-semibold text-[var(--nn-true-blue)]">Activos</h2>
              <button onClick={openAddActivo} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-white text-sm font-medium transition-colors">
                <Plus size={16} /> Agregar
              </button>
            </div>
            {activosList.length > 0 ? (
              <div className="divide-y divide-[var(--nn-border)]">
                {activosList.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--nn-bg)] transition-colors">
                    <div>
                      <span className="font-medium text-[var(--nn-true-blue)]">{a.entidad}</span>
                      <span className="text-[var(--nn-text-muted)] ml-2">- {a.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[var(--nn-true-blue)]">{fmt(Number(a.monto))}</span>
                      <button onClick={() => openEditActivo(a)} className="text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)]"><Pencil size={16} /></button>
                      <button onClick={() => deleteActivo(a.id)} className="text-[var(--nn-text-muted)] hover:text-[#ef4444]"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-4 text-[var(--nn-text-muted)] text-sm">Sin activos registrados</p>
            )}
            <div className="px-4 py-3 border-t border-[var(--nn-border)] bg-[var(--nn-bg)]">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--nn-true-blue)]">Subtotal Activos</span>
                <span className="font-bold text-[var(--nn-true-blue)]">{fmt(activosList.reduce((s, a) => s + Number(a.monto), 0))}</span>
              </div>
            </div>
          </div>

          {/* Inversiones (entidades) */}
          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--nn-border)]">
              <h2 className="text-lg font-semibold text-[var(--nn-true-blue)]">Inversiones (Entidades)</h2>
              <button
                onClick={() => {
                  setEditActivo(null);
                  setFEntidad(ENTIDADES[0]);
                  setFTipo("inversion");
                  setFDesc("");
                  setFMonto("");
                  setModalActivo(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--nn-light-blue)] hover:bg-[var(--nn-true-blue)] text-white text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>
            {inversionesList.length > 0 ? (
              <div className="divide-y divide-[var(--nn-border)]">
                {inversionesList.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--nn-bg)] transition-colors">
                    <div>
                      <span className="font-medium text-[var(--nn-true-blue)]">{a.entidad}</span>
                      <span className="text-[var(--nn-text-muted)] ml-2">- {a.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#c084fc]">{fmt(Number(a.monto))}</span>
                      <button onClick={() => openEditActivo(a)} className="text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)]"><Pencil size={16} /></button>
                      <button onClick={() => deleteActivo(a.id)} className="text-[var(--nn-text-muted)] hover:text-[#ef4444]"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-4 text-[var(--nn-text-muted)] text-sm">Sin inversiones registradas</p>
            )}
            <div className="px-4 py-3 border-t border-[var(--nn-border)] bg-[var(--nn-bg)]">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--nn-true-blue)]">Subtotal Inversiones</span>
                <span className="font-bold text-[#c084fc]">{fmt(inversionesList.reduce((s, a) => s + Number(a.monto), 0))}</span>
              </div>
            </div>
          </div>

          {/* Cocos Capital */}
          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--nn-border)]">
              <h2 className="text-lg font-semibold text-[var(--nn-true-blue)]">Cocos Capital - Inversiones</h2>
              <button onClick={openAddInv} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-white text-sm font-medium transition-colors">
                <Plus size={16} /> Agregar
              </button>
            </div>
            {TIPOS_COCOS.map((tipo) => {
              const items = inversiones.filter((i) => normalizeTipo(i.tipo) === normalizeTipo(tipo));
              if (items.length === 0) return null;
              return (
                <div key={tipo}>
                  <div className="px-4 py-2 bg-[var(--nn-bg)]/30">
                    <span className="text-sm font-medium text-[var(--nn-true-blue)]">{tipo}</span>
                  </div>
                  <div className="divide-y divide-[var(--nn-border)]">
                    {items.map((i) => (
                      <div key={i.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--nn-bg)] transition-colors">
                        <div>
                          <span className="text-[var(--nn-text-muted)]">{i.descripcion || tipo}</span>
                          <p className="text-xs text-[var(--nn-text-muted)] mt-0.5">
                            {new Date(`${String(i.fecha).slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[var(--nn-true-blue)]">{fmt(Number(i.monto))}</span>
                          <button onClick={() => openEditInv(i)} className="text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)]"><Pencil size={16} /></button>
                          <button onClick={() => deleteInv(i.id)} className="text-[var(--nn-text-muted)] hover:text-[#ef4444]"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {inversiones.length === 0 && (
              <p className="px-4 py-4 text-[var(--nn-text-muted)] text-sm">Sin inversiones en Cocos Capital</p>
            )}
            <div className="px-4 py-3 border-t border-[var(--nn-border)] bg-[var(--nn-bg)]">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--nn-true-blue)]">Subtotal Cocos Capital</span>
                <span className="font-bold text-[var(--nn-true-blue)]">{fmt(totalInversiones)}</span>
              </div>
            </div>
          </div>

          {/* Histórico de Cauciones */}
          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--nn-border)]">
              <div>
                <h2 className="text-lg font-semibold text-[var(--nn-true-blue)]">Histórico de Cauciones</h2>
                <p className="text-sm text-[var(--nn-text-muted)]">Seguimiento diario: invertido vs dia anterior</p>
              </div>
              {caucionesHistorial.length > 1 && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${caucionesDiff > 0 ? "bg-green-500/10 text-[#10b981]" : caucionesDiff < 0 ? "bg-red-500/10 text-[#ef4444]" : "bg-[#eef4ff] text-[var(--nn-text-muted)]"}`}>
                  {caucionesDiff !== 0 ? (
                    caucionesDiff > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />
                  ) : null}
                  <span>{caucionesDiff === 0 ? "Sin cambio vs ayer" : `${fmt(Math.abs(caucionesDiff))} vs ayer`}</span>
                </div>
              )}
            </div>

            {caucionesChartData.length > 1 && (
              <div className="p-4 border-b border-[var(--nn-border)]">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <LineChart data={caucionesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d7e4ff" />
                      <XAxis dataKey="fecha" stroke="#5a6f99" fontSize={11} />
                      <YAxis stroke="#5a6f99" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #d7e4ff", borderRadius: "8px", color: "#0a2a66" }} />
                      <Line type="monotone" dataKey="Total" stroke="var(--nn-true-blue)" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {caucionesHistorial.length > 0 ? (
              <div className="divide-y divide-[var(--nn-border)]">
                {caucionesHistorial.map((item, idx) => {
                  const prev = idx < caucionesHistorial.length - 1 ? Number(caucionesHistorial[idx + 1].monto) : Number(item.monto);
                  const diff = Number(item.monto) - prev;
                  return (
                    <div key={item.fecha} className="flex items-center justify-between px-4 py-3">
                      <span className="text-[var(--nn-text-muted)]">{new Date(`${item.fecha}T00:00:00`).toLocaleDateString("es-AR")}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[var(--nn-true-blue)]">{fmt(Number(item.monto))}</span>
                        {idx < caucionesHistorial.length - 1 && (
                          <span className={`text-xs font-medium ${diff > 0 ? "text-[#10b981]" : diff < 0 ? "text-[#ef4444]" : "text-[var(--nn-text-muted)]"}`}>
                            {diff > 0 ? "+" : ""}{fmt(diff)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-4 py-4 text-[var(--nn-text-muted)] text-sm">Sin registros de cauciones todavía</p>
            )}
          </div>

          {/* Modal Activo */}
          <Modal isOpen={modalActivo} onClose={() => setModalActivo(false)} title={editActivo ? "Editar" : "Agregar Activo/Inversión"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Entidad</label>
                <select value={fEntidad} onChange={(e) => setFEntidad(e.target.value)} className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]">
                  {ENTIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Tipo</label>
                <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]">
                  {TIPOS.map((t) => <option key={t} value={t}>{t === "activo" ? "Activo" : "Inversión"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Descripción</label>
                <input type="text" value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Ej: Caja de Ahorro, FIMA..." className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Monto</label>
                <input type="number" value={fMonto} onChange={(e) => setFMonto(e.target.value)} placeholder="0.00" className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button onClick={() => saveActivo(false)} disabled={savingActivo} className="w-full py-2 rounded-lg bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors">
                  {editActivo ? "Actualizar" : "Guardar"}
                </button>
                {!editActivo && (
                  <button onClick={() => saveActivo(true)} disabled={savingActivo} className="w-full py-2 rounded-lg bg-[var(--nn-true-blue-hover)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors">
                    Guardar y agregar otro
                  </button>
                )}
              </div>
            </div>
          </Modal>

          {/* Modal Inversion Cocos */}
          <Modal isOpen={modalInv} onClose={() => setModalInv(false)} title={editInv ? "Editar Inversión Cocos" : "Agregar Inversión Cocos"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Tipo</label>
                <select value={fInvTipo} onChange={(e) => setFInvTipo(e.target.value)} className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]">
                  {TIPOS_COCOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Descripción</label>
                <input type="text" value={fInvDesc} onChange={(e) => setFInvDesc(e.target.value)} placeholder="Descripción..." className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Monto</label>
                <input type="number" value={fInvMonto} onChange={(e) => setFInvMonto(e.target.value)} placeholder="0.00" className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Fecha</label>
                <input type="date" value={fInvFecha} onChange={(e) => setFInvFecha(e.target.value)} className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <button onClick={saveInv} disabled={savingInv} className="w-full py-2 rounded-lg bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors">
                {editInv ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}




