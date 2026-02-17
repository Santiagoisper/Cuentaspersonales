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

interface InversionCocos {
  id: number;
  tipo: string;
  descripcion: string;
  monto: number;
}

const ENTIDADES = ["GALICIA", "EFECTIVO", "COCOS CAPITAL", "Otro"];
const TIPOS = ["activo", "inversion"];
const TIPOS_COCOS = ["CAUCIONES", "ACCIONES", "LETRAS", "Obligaciones Negociables", "BONOS", "Otros"];

export default function ActivosPage() {
  const [loading, setLoading] = useState(false);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
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

  const fetchData = useCallback(() => {
    fetch("/api/activos")
      .then(async (r) => {
        const data = await r.json();
        return data && typeof data === "object" ? data : { activos: [], historial: [] };
      })
      .then((data) => {
        setActivos(Array.isArray(data.activos) ? data.activos : []);
        setHistorial(Array.isArray(data.historial) ? data.historial : []);
      })
      .catch(() => {
        setActivos([]);
        setHistorial([]);
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

  const saveActivo = async () => {
    const method = editActivo ? "PUT" : "POST";
    const body = editActivo
      ? { id: editActivo.id, entidad: fEntidad, tipo: fTipo, descripcion: fDesc, monto: Number(fMonto) || 0 }
      : { entidad: fEntidad, tipo: fTipo, descripcion: fDesc, monto: Number(fMonto) || 0 };
    await fetch("/api/activos", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModalActivo(false);
    fetchData();
  };

  const deleteActivo = async (id: number) => {
    if (!confirm("Â¿Eliminar este activo?")) return;
    await fetch("/api/activos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData();
  };

  // Inversion handlers
  const openAddInv = () => {
    setEditInv(null);
    setFInvTipo(TIPOS_COCOS[0]);
    setFInvDesc("");
    setFInvMonto("");
    setModalInv(true);
  };

  const openEditInv = (i: InversionCocos) => {
    setEditInv(i);
    setFInvTipo(i.tipo);
    setFInvDesc(i.descripcion || "");
    setFInvMonto(String(i.monto));
    setModalInv(true);
  };

  const saveInv = async () => {
    const method = editInv ? "PUT" : "POST";
    const body = editInv
      ? { id: editInv.id, tipo: fInvTipo, descripcion: fInvDesc, monto: Number(fInvMonto) || 0 }
      : { tipo: fInvTipo, descripcion: fInvDesc, monto: Number(fInvMonto) || 0 };
    await fetch("/api/inversiones", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModalInv(false);
    fetchData();
  };

  const deleteInv = async (id: number) => {
    if (!confirm("Â¿Eliminar esta inversiÃ³n?")) return;
    await fetch("/api/inversiones", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const totalActivos = activos.reduce((s, a) => s + Number(a.monto), 0);
  const totalInversiones = inversiones.reduce((s, i) => s + Number(i.monto), 0);
  const grandTotal = totalActivos + totalInversiones;

  const activosList = activos.filter((a) => a.tipo === "activo");
  const inversionesList = activos.filter((a) => a.tipo === "inversion");

  const chartData = [...historial].reverse().map((h) => ({
    fecha: new Date(h.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
    Total: moneda === "USD" ? Math.round(Number(h.total) / cotizacion) : Number(h.total),
  }));

  // Comparison with yesterday
  const todayTotal = historial.length > 0 ? Number(historial[0].total) : 0;
  const yesterdayTotal = historial.length > 1 ? Number(historial[1].total) : 0;
  const dailyDiff = todayTotal - yesterdayTotal;

  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <Sidebar />
      <main className="lg:ml-72 p-5 pt-20 lg:p-10 lg:pt-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2a66]">Activos & Inversiones</h1>
            <p className="text-[#5a6f99]">Patrimonio y portafolio de inversiones</p>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} onMonedaChange={setMoneda} />

          {/* Grand Total */}
          <div className="bg-gradient-to-r from-[#eef4ff] to-[#ffffff] rounded-xl border border-[#d7e4ff] p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-[#5a6f99]">Total Patrimonio</p>
                <p className="text-3xl font-bold text-[#0a2a66] mt-1">{fmt(grandTotal)}</p>
              </div>
              {dailyDiff !== 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${dailyDiff > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {dailyDiff > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  <span className="font-medium">{fmt(Math.abs(dailyDiff))} vs ayer</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical chart */}
          {chartData.length > 1 && (
            <div className="bg-white rounded-xl border border-[#d7e4ff] p-6">
              <h2 className="text-lg font-semibold text-[#0a2a66] mb-4">EvoluciÃ³n del Patrimonio</h2>
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
          <div className="bg-white rounded-xl border border-[#d7e4ff] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#d7e4ff]">
              <h2 className="text-lg font-semibold text-[#0a2a66]">Activos</h2>
              <button onClick={openAddActivo} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1650c7] hover:bg-[#1141a6] text-white text-sm font-medium transition-colors">
                <Plus size={16} /> Agregar
              </button>
            </div>
            {activosList.length > 0 ? (
              <div className="divide-y divide-[#e5edff]">
                {activosList.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#eef4ff]/30 transition-colors">
                    <div>
                      <span className="font-medium text-[#0a2a66]">{a.entidad}</span>
                      <span className="text-[#5a6f99] ml-2">- {a.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#0a2a66]">{fmt(Number(a.monto))}</span>
                      <button onClick={() => openEditActivo(a)} className="text-[#7a8fb8] hover:text-blue-400"><Pencil size={16} /></button>
                      <button onClick={() => deleteActivo(a.id)} className="text-[#7a8fb8] hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-4 text-[#7a8fb8] text-sm">Sin activos registrados</p>
            )}
            <div className="px-4 py-3 border-t border-[#c9dbff] bg-[#f4f8ff]/50">
              <div className="flex justify-between">
                <span className="font-bold text-[#0a2a66]">Subtotal Activos</span>
                <span className="font-bold text-[#0a2a66]">{fmt(activosList.reduce((s, a) => s + Number(a.monto), 0))}</span>
              </div>
            </div>
          </div>

          {/* Inversiones (entidades) */}
          <div className="bg-white rounded-xl border border-[#d7e4ff] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#d7e4ff]">
              <h2 className="text-lg font-semibold text-[#0a2a66]">Inversiones (Entidades)</h2>
              <button
                onClick={() => {
                  setEditActivo(null);
                  setFEntidad(ENTIDADES[0]);
                  setFTipo("inversion");
                  setFDesc("");
                  setFMonto("");
                  setModalActivo(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5f63d6] hover:bg-[#4e51bc] text-white text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>
            {inversionesList.length > 0 ? (
              <div className="divide-y divide-[#e5edff]">
                {inversionesList.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#eef4ff]/30 transition-colors">
                    <div>
                      <span className="font-medium text-[#0a2a66]">{a.entidad}</span>
                      <span className="text-[#5a6f99] ml-2">- {a.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-purple-400">{fmt(Number(a.monto))}</span>
                      <button onClick={() => openEditActivo(a)} className="text-[#7a8fb8] hover:text-blue-400"><Pencil size={16} /></button>
                      <button onClick={() => deleteActivo(a.id)} className="text-[#7a8fb8] hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-4 text-[#7a8fb8] text-sm">Sin inversiones registradas</p>
            )}
            <div className="px-4 py-3 border-t border-[#c9dbff] bg-[#f4f8ff]/50">
              <div className="flex justify-between">
                <span className="font-bold text-[#0a2a66]">Subtotal Inversiones</span>
                <span className="font-bold text-purple-400">{fmt(inversionesList.reduce((s, a) => s + Number(a.monto), 0))}</span>
              </div>
            </div>
          </div>

          {/* Cocos Capital */}
          <div className="bg-white rounded-xl border border-[#d7e4ff] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#d7e4ff]">
              <h2 className="text-lg font-semibold text-[#0a2a66]">Cocos Capital - Inversiones</h2>
              <button onClick={openAddInv} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium transition-colors">
                <Plus size={16} /> Agregar
              </button>
            </div>
            {TIPOS_COCOS.map((tipo) => {
              const items = inversiones.filter((i) => i.tipo === tipo);
              if (items.length === 0) return null;
              return (
                <div key={tipo}>
                  <div className="px-4 py-2 bg-[#eef4ff]/30">
                    <span className="text-sm font-medium text-yellow-400">{tipo}</span>
                  </div>
                  <div className="divide-y divide-[#e5edff]">
                    {items.map((i) => (
                      <div key={i.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#eef4ff]/30 transition-colors">
                        <span className="text-[#5a6f99]">{i.descripcion || tipo}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[#0a2a66]">{fmt(Number(i.monto))}</span>
                          <button onClick={() => openEditInv(i)} className="text-[#7a8fb8] hover:text-blue-400"><Pencil size={16} /></button>
                          <button onClick={() => deleteInv(i.id)} className="text-[#7a8fb8] hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {inversiones.length === 0 && (
              <p className="px-4 py-4 text-[#7a8fb8] text-sm">Sin inversiones en Cocos Capital</p>
            )}
            <div className="px-4 py-3 border-t border-[#c9dbff] bg-[#f4f8ff]/50">
              <div className="flex justify-between">
                <span className="font-bold text-[#0a2a66]">Subtotal Cocos Capital</span>
                <span className="font-bold text-yellow-400">{fmt(totalInversiones)}</span>
              </div>
            </div>
          </div>

          {/* Modal Activo */}
          <Modal isOpen={modalActivo} onClose={() => setModalActivo(false)} title={editActivo ? "Editar" : "Agregar Activo/InversiÃ³n"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">Entidad</label>
                <select value={fEntidad} onChange={(e) => setFEntidad(e.target.value)} className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]">
                  {ENTIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">Tipo</label>
                <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]">
                  {TIPOS.map((t) => <option key={t} value={t}>{t === "activo" ? "Activo" : "InversiÃ³n"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">DescripciÃ³n</label>
                <input type="text" value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Ej: Caja de Ahorro, FIMA..." className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">Monto</label>
                <input type="number" value={fMonto} onChange={(e) => setFMonto(e.target.value)} placeholder="0.00" className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]" />
              </div>
              <button onClick={saveActivo} className="w-full py-2 rounded-lg bg-[#1650c7] hover:bg-[#1141a6] text-white font-medium transition-colors">
                {editActivo ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </Modal>

          {/* Modal Inversion Cocos */}
          <Modal isOpen={modalInv} onClose={() => setModalInv(false)} title={editInv ? "Editar InversiÃ³n Cocos" : "Agregar InversiÃ³n Cocos"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">Tipo</label>
                <select value={fInvTipo} onChange={(e) => setFInvTipo(e.target.value)} className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]">
                  {TIPOS_COCOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">DescripciÃ³n</label>
                <input type="text" value={fInvDesc} onChange={(e) => setFInvDesc(e.target.value)} placeholder="DescripciÃ³n..." className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a6f99] mb-1">Monto</label>
                <input type="number" value={fInvMonto} onChange={(e) => setFInvMonto(e.target.value)} placeholder="0.00" className="w-full bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-3 py-2 text-[#0a2a66]" />
              </div>
              <button onClick={saveInv} className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors">
                {editInv ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}


