"use client";

import { DollarSign, ArrowRightLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DollarBannerProps {
  onCotizacionChange?: (cotizacion: number) => void;
  onMonedaChange?: (moneda: string) => void;
}

export default function DollarBanner({ onCotizacionChange, onMonedaChange }: DollarBannerProps) {
  const [cotizacion, setCotizacion] = useState<number>(1000);
  const [moneda, setMoneda] = useState<string>("ARS");
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState("");
  const onCotizacionChangeRef = useRef(onCotizacionChange);
  const onMonedaChangeRef = useRef(onMonedaChange);

  useEffect(() => {
    onCotizacionChangeRef.current = onCotizacionChange;
  }, [onCotizacionChange]);

  useEffect(() => {
    onMonedaChangeRef.current = onMonedaChange;
  }, [onMonedaChange]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchConfig = async () => {
      try {
        const configResponse = await fetch("/api/config", { signal: controller.signal });
        if (!configResponse.ok) return;
        const configData = await configResponse.json();

        if (configData.cotizacion_dolar) {
          const val = Number(configData.cotizacion_dolar) || 1000;
          setCotizacion(val);
          onCotizacionChangeRef.current?.(val);
        }

        if (configData.moneda_display) {
          setMoneda(configData.moneda_display);
          onMonedaChangeRef.current?.(configData.moneda_display);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching cotizacion:", error);
      }
    };

    fetchConfig();
    return () => controller.abort();
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
    <div className="overflow-hidden rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)]">
      <div className="h-0.5 bg-[var(--nn-true-blue)]" />

      <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-5 md:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--nn-primary-soft)]">
            <DollarSign className="text-[var(--nn-true-blue)]" size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nn-text-muted)]">Tipo de cambio USD / ARS</p>
            {editing ? (
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="number"
                  value={tempVal}
                  onChange={(e) => setTempVal(e.target.value)}
                  className="w-32 rounded-lg border border-[var(--nn-border)] bg-[var(--nn-bg)] px-3 py-2 text-base font-semibold text-[var(--nn-true-blue)] outline-none focus:border-[var(--nn-true-blue)]"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveCotizacion()}
                />
                <button onClick={saveCotizacion} className="text-sm font-semibold text-[var(--nn-true-blue)] hover:text-[var(--nn-true-blue-hover)]">
                  Guardar
                </button>
                <button onClick={() => setEditing(false)} className="text-sm text-[var(--nn-text-muted)] hover:text-[var(--nn-true-blue)]">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                className="mt-1 text-3xl font-bold tracking-tight text-[var(--nn-true-blue)] transition-colors hover:text-[var(--nn-true-blue-hover)]"
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
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--nn-border)] bg-[var(--nn-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--nn-true-blue)] transition-colors hover:bg-[var(--nn-primary-soft)]"
        >
          <ArrowRightLeft size={16} />
          Mostrar en {moneda === "ARS" ? "USD" : "ARS"}
        </button>
      </div>
    </div>
  );
}
