"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DollarBanner from "@/components/DollarBanner";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, DollarSign, Banknote, Home, Users, Building2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Dolar {
  id: number;
  ubicacion: string;
  detalle: string | null;
  monto: number;
}

const UBICACIONES = ["GALICIA", "PRESTADO", "EN CASA", "BOFA"];
const UBICACION_ICONS: Record<string, typeof DollarSign> = {
  "GALICIA": Building2,
  "PRESTADO": Users,
  "EN CASA": Home,
  "BOFA": Banknote,
};
const COLORS = ["#3b82f6", "#a855f7", "#22c55e", "#eab308", "#ef4444", "#06b6d4"];

export default function DolaresPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dolares, setDolares] = useState<Dolar[]>([]);
  const [cotizacion, setCotizacion] = useState(1000);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Dolar | null>(null);
  const [fUbicacion, setFUbicacion] = useState("");
  const [fNuevaUbicacion, setFNuevaUbicacion] = useState("");
  const [fDetalle, setFDetalle] = useState("");
  const [fMonto, setFMonto] = useState("");

  const ubicacionesDisponibles = Array.from(
    new Set([...UBICACIONES, ...dolares.map((d) => d.ubicacion)])
  );

  const fetchData = useCallback(() => {
    fetch("/api/dolares")
      .then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then(setDolares)
      .catch(() => setDolares([]));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setEditItem(null);
    setFUbicacion(ubicacionesDisponibles[0] || "");
    setFNuevaUbicacion("");
    setFDetalle("");
    setFMonto("");
    setModalOpen(true);
  };

  const openEdit = (item: Dolar) => {
    setEditItem(item);
    setFUbicacion(item.ubicacion);
    setFNuevaUbicacion("");
    setFDetalle(item.detalle || "");
    setFMonto(String(item.monto));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const method = editItem ? "PUT" : "POST";
    const body = editItem
      ? { id: editItem.id, ubicacion: fUbicacion, detalle: fDetalle, monto: Number(fMonto) || 0 }
      : { ubicacion: fUbicacion, detalle: fDetalle, monto: Number(fMonto) || 0 };
    try {
      await fetch("/api/dolares", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      fetchData();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddUbicacion = () => {
    const nueva = fNuevaUbicacion.trim().toUpperCase();
    if (!nueva) return;
    setFUbicacion(nueva);
    setFNuevaUbicacion("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este registro?")) return;
    await fetch("/api/dolares", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nn-bg)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const totalUSD = dolares.reduce((s, d) => s + Number(d.monto), 0);
  const totalARS = totalUSD * cotizacion;

  // Group by ubicacion
  const grouped: Record<string, Dolar[]> = {};
  dolares.forEach((d) => {
    if (!grouped[d.ubicacion]) grouped[d.ubicacion] = [];
    grouped[d.ubicacion].push(d);
  });

  const pieData = Object.entries(grouped).map(([ubicacion, items]) => ({
    name: ubicacion,
    value: items.reduce((s, d) => s + Number(d.monto), 0),
  })).filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-[var(--nn-bg)]">
      <Sidebar />
      <main className="p-5 md:p-10 md:pr-[18rem]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--nn-true-blue)]">Dolares</h1>
              <p className="text-[var(--nn-text-muted)]">Tenencias en dolares por ubicacion</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-[var(--nn-snow-white)] font-medium transition-colors">
              <Plus size={18} /> Agregar
            </button>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} />

          {/* Total */}
          <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--nn-primary-soft)] rounded-xl">
                <DollarSign className="text-[var(--nn-true-blue)]" size={28} />
              </div>
              <div>
                <p className="text-sm text-[var(--nn-text-muted)]">Total en Dolares</p>
                <p className="text-3xl font-bold text-[var(--nn-true-blue)]">U$S {totalUSD.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[var(--nn-text-muted)] mt-1">
                  Equivalente: $ {totalARS.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--nn-true-blue)] mb-4">Distribucion</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #d7e4ff",
                          borderRadius: "8px",
                          color: "#0a2a66",
                        }}
                        formatter={(value) => [`U$S ${Number(value).toLocaleString("es-AR")}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-[var(--nn-text-muted)]">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cards by ubicacion */}
            <div className="space-y-4">
              {ubicacionesDisponibles.map((ubi) => {
                const items = grouped[ubi] || [];
                const total = items.reduce((s, d) => s + Number(d.monto), 0);
                const Icon = UBICACION_ICONS[ubi] || DollarSign;

                return (
                  <div key={ubi} className="bg-[var(--nn-snow-white)] rounded-xl border border-[var(--nn-border)] overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--nn-border)]">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-[var(--nn-true-blue)]" />
                        <span className="font-medium text-[var(--nn-true-blue)]">{ubi}</span>
                      </div>
                      <span className="font-bold text-[var(--nn-true-blue)]">U$S {total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {items.length > 0 ? (
                      <div className="divide-y divide-[#e1eaf7]">
                        {items.map((d) => (
                          <div key={d.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--nn-bg)] transition-colors">
                            <span className="text-[var(--nn-text-muted)]">{d.detalle || ubi}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[var(--nn-true-blue)]">U$S {Number(d.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                              <button onClick={() => openEdit(d)} className="text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)]"><Pencil size={16} /></button>
                              <button onClick={() => handleDelete(d.id)} className="text-[var(--nn-text-muted)] hover:text-[#ef4444]"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-sm text-[var(--nn-text-muted)]">Sin registros</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal */}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar dolares" : "Agregar dolares"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Ubicacion</label>
                <select value={fUbicacion} onChange={(e) => setFUbicacion(e.target.value)} className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]">
                  {ubicacionesDisponibles.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                {!editItem && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={fNuevaUbicacion}
                      onChange={(e) => setFNuevaUbicacion(e.target.value)}
                      placeholder="Nueva ubicacion..."
                      className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddUbicacion}
                      className="px-3 py-2 rounded-lg bg-[var(--nn-true-blue-hover)] hover:opacity-90 text-white text-sm font-medium transition-colors"
                    >
                      Crear
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">
                  Detalle {fUbicacion === "PRESTADO" && "(A quien?)"}
                </label>
                <input type="text" value={fDetalle} onChange={(e) => setFDetalle(e.target.value)} placeholder={fUbicacion === "PRESTADO" ? "Nombre de la persona..." : "Detalle opcional..."} className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--nn-text-muted)] mb-1">Monto (USD)</label>
                <input type="number" value={fMonto} onChange={(e) => setFMonto(e.target.value)} placeholder="0.00" className="w-full bg-[var(--nn-bg)] border border-[var(--nn-border)] rounded-lg px-3 py-2 text-[var(--nn-true-blue)]" />
              </div>
              <div>
                <button onClick={handleSave} disabled={saving} className="w-full py-2 rounded-lg bg-[var(--nn-true-blue)] hover:bg-[var(--nn-true-blue-hover)] text-[var(--nn-snow-white)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors">
                  {editItem ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}




