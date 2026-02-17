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
  const [dolares, setDolares] = useState<Dolar[]>([]);
  const [cotizacion, setCotizacion] = useState(1000);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Dolar | null>(null);
  const [fUbicacion, setFUbicacion] = useState("");
  const [fDetalle, setFDetalle] = useState("");
  const [fMonto, setFMonto] = useState("");

  const fetchData = useCallback(() => {
    fetch("/api/dolares")
      .then((r) => r.json())
      .then(setDolares)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setEditItem(null);
    setFUbicacion(UBICACIONES[0]);
    setFDetalle("");
    setFMonto("");
    setModalOpen(true);
  };

  const openEdit = (item: Dolar) => {
    setEditItem(item);
    setFUbicacion(item.ubicacion);
    setFDetalle(item.detalle || "");
    setFMonto(String(item.monto));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const method = editItem ? "PUT" : "POST";
    const body = editItem
      ? { id: editItem.id, ubicacion: fUbicacion, detalle: fDetalle, monto: Number(fMonto) || 0 }
      : { ubicacion: fUbicacion, detalle: fDetalle, monto: Number(fMonto) || 0 };
    await fetch("/api/dolares", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch("/api/dolares", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
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
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="lg:ml-64 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dólares</h1>
              <p className="text-[#94a3b8]">Tenencias en dólares por ubicación</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors">
              <Plus size={18} /> Agregar
            </button>
          </div>

          <DollarBanner onCotizacionChange={setCotizacion} />

          {/* Total */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-[#1e293b] rounded-xl border border-yellow-500/20 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <DollarSign className="text-yellow-400" size={28} />
              </div>
              <div>
                <p className="text-sm text-[#94a3b8]">Total en Dólares</p>
                <p className="text-3xl font-bold text-yellow-400">U$S {totalUSD.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-[#94a3b8] mt-1">
                  Equivalente: $ {totalARS.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Distribución</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
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
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f1f5f9",
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
                      <span className="text-sm text-[#94a3b8]">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cards by ubicacion */}
            <div className="space-y-4">
              {UBICACIONES.map((ubi) => {
                const items = grouped[ubi] || [];
                const total = items.reduce((s, d) => s + Number(d.monto), 0);
                const Icon = UBICACION_ICONS[ubi] || DollarSign;

                return (
                  <div key={ubi} className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-[#334155]">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-yellow-400" />
                        <span className="font-medium text-white">{ubi}</span>
                      </div>
                      <span className="font-bold text-yellow-400">U$S {total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {items.length > 0 ? (
                      <div className="divide-y divide-[#334155]">
                        {items.map((d) => (
                          <div key={d.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#334155]/30 transition-colors">
                            <span className="text-[#94a3b8]">{d.detalle || ubi}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-white">U$S {Number(d.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                              <button onClick={() => openEdit(d)} className="text-[#64748b] hover:text-blue-400"><Pencil size={16} /></button>
                              <button onClick={() => handleDelete(d.id)} className="text-[#64748b] hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-sm text-[#64748b]">Sin registros</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal */}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Dólares" : "Agregar Dólares"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Ubicación</label>
                <select value={fUbicacion} onChange={(e) => setFUbicacion(e.target.value)} className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-white">
                  {UBICACIONES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                  Detalle {fUbicacion === "PRESTADO" && "(¿A quién?)"}
                </label>
                <input type="text" value={fDetalle} onChange={(e) => setFDetalle(e.target.value)} placeholder={fUbicacion === "PRESTADO" ? "Nombre de la persona..." : "Detalle opcional..."} className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Monto (USD)</label>
                <input type="number" value={fMonto} onChange={(e) => setFMonto(e.target.value)} placeholder="0.00" className="w-full bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-white" />
              </div>
              <button onClick={handleSave} className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors">
                {editItem ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
