"use client";

import { DollarSign, ArrowRightLeft } from "lucide-react";
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
    const fetchConfig = async () => {
      try {
        const configResponse = await fetch("/api/config");
        const configData = await configResponse.json();

        if (configData.cotizacion_dolar) {
          const val = Number(configData.cotizacion_dolar) || 1000;
          setCotizacion(val);
          onCotizacionChange?.(val);
        }

        if (configData.moneda_display) {
          setMoneda(configData.moneda_display);
          onMonedaChange?.(configData.moneda_display);
        }
      } catch (error) {
        console.error("Error fetching cotizacion:", error);
      }
    };

    fetchConfig();
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
    <div className="overflow-hidden rounded-2xl border border-[#d2dff1] bg-white shadow-[0_14px_40px_rgba(23,60,130,0.09)]">
      <div className="h-1 bg-gradient-to-r from-[#0d2a5f] via-[#1652c4] to-[#5e93fa]" />

      <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-5 md:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecf3ff]">
            <DollarSign className="text-[#1652c4]" size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6178a0]">Tipo de cambio USD / ARS</p>
            {editing ? (
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="number"
                  value={tempVal}
                  onChange={(e) => setTempVal(e.target.value)}
                  className="w-32 rounded-xl border border-[#cad8ef] bg-[#f8fbff] px-3 py-2 text-base font-semibold text-[#0d2a5f] outline-none focus:border-[#1652c4]"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveCotizacion()}
                />
                <button onClick={saveCotizacion} className="text-sm font-semibold text-[#1652c4] hover:text-[#0f3c92]">
                  Guardar
                </button>
                <button onClick={() => setEditing(false)} className="text-sm text-[#6178a0] hover:text-[#0d2a5f]">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                className="mt-1 text-3xl font-bold tracking-tight text-[#0d2a5f] transition-colors hover:text-[#1652c4]"
                onClick={() => {
                  setTempVal(String(cotizacion));
                  setEditing(true);
                }}
              >
                $ {cotizacion.toLocaleString("es-AR")}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={toggleMoneda}
          className="inline-flex items-center gap-2 rounded-xl border border-[#c9d8f0] bg-[#f7faff] px-4 py-2.5 text-sm font-semibold text-[#12459f] transition-all hover:border-[#1652c4] hover:bg-[#ecf3ff]"
        >
          <ArrowRightLeft size={16} />
          Mostrar en {moneda === "ARS" ? "USD" : "ARS"}
        </button>
      </div>
    </div>
  );
}
