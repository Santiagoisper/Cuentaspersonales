"use client";

import { DollarSign, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface DollarBannerProps {
  onCotizacionChange?: (cotizacion: number) => void;
  onMonedaChange?: (moneda: string) => void;
}

export default function DollarBanner({ onCotizacionChange, onMonedaChange }: DollarBannerProps) {
  const [cotizacion, setCotizacion] = useState<number>(1000);
  const [moneda, setMoneda] = useState<string>("ARS");
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.cotizacion_dolar) {
          setCotizacion(Number(data.cotizacion_dolar));
          onCotizacionChange?.(Number(data.cotizacion_dolar));
        }
        if (data.moneda_display) {
          setMoneda(data.moneda_display);
          onMonedaChange?.(data.moneda_display);
        }
      })
      .catch(() => {});
  }, []);

  const saveCotizacion = async () => {
    const val = Number(tempVal);
    if (val > 0) {
      setCotizacion(val);
      onCotizacionChange?.(val);
      await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "cotizacion_dolar", value: String(val) }),
      });
    }
    setEditing(false);
  };

  const toggleMoneda = async () => {
    const newMoneda = moneda === "ARS" ? "USD" : "ARS";
    setMoneda(newMoneda);
    onMonedaChange?.(newMoneda);
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "moneda_display", value: newMoneda }),
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e293b] rounded-xl border border-[#334155] p-4 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <DollarSign className="text-yellow-400" size={24} />
        </div>
        <div>
          <p className="text-sm text-[#94a3b8]">Cotización Dólar</p>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                className="bg-[#334155] border border-[#475569] rounded px-2 py-1 text-white w-28 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveCotizacion()}
              />
              <button onClick={saveCotizacion} className="text-green-400 text-sm font-medium hover:underline">
                OK
              </button>
            </div>
          ) : (
            <p
              className="text-lg font-bold text-white cursor-pointer hover:text-yellow-400 transition-colors"
              onClick={() => {
                setTempVal(String(cotizacion));
                setEditing(true);
              }}
            >
              $ {cotizacion.toLocaleString("es-AR")}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={toggleMoneda}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors"
      >
        <RefreshCw size={16} />
        <span className="font-medium">
          Mostrar en: <span className="text-yellow-400">{moneda}</span>
        </span>
      </button>
    </div>
  );
}
