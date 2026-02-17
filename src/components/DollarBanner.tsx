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
          const val = Number(data.cotizacion_dolar);
          setCotizacion(val);
          onCotizacionChange?.(val);
        }
        if (data.moneda_display) {
          setMoneda(data.moneda_display);
          onMonedaChange?.(data.moneda_display);
        }
      })
      .catch(() => {});
  }, [onCotizacionChange, onMonedaChange]);

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
    <div className="bg-white rounded-2xl border border-[#d7e4ff] p-4 flex items-center justify-between flex-wrap gap-4 shadow-[0_8px_24px_rgba(22,80,199,0.08)]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#eaf2ff] rounded-xl">
          <DollarSign className="text-[#1650c7]" size={22} />
        </div>
        <div>
          <p className="text-sm text-[#5a6f99]">Cotizacion dolar</p>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                className="bg-[#eef4ff] border border-[#c9dbff] rounded-lg px-2 py-1 text-[#0a2a66] w-28 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveCotizacion()}
              />
              <button onClick={saveCotizacion} className="text-[#0f9b62] text-sm font-medium hover:underline">
                OK
              </button>
            </div>
          ) : (
            <p
              className="text-lg font-bold text-[#0a2a66] cursor-pointer hover:text-[#1650c7] transition-colors"
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
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c9dbff] bg-[#eef4ff] hover:bg-[#dfeaff] transition-colors text-[#0a2a66]"
      >
        <RefreshCw size={16} />
        <span className="font-medium">
          Mostrar en: <span className="text-[#1650c7]">{moneda}</span>
        </span>
      </button>
    </div>
  );
}
