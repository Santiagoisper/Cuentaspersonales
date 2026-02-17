"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  mes: number;
  anio: number;
  onChange: (mes: number, anio: number) => void;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function MonthSelector({ mes, anio, onChange }: MonthSelectorProps) {
  const prev = () => {
    if (mes === 1) onChange(12, anio - 1);
    else onChange(mes - 1, anio);
  };

  const next = () => {
    if (mes === 12) onChange(1, anio + 1);
    else onChange(mes + 1, anio);
  };

  return (
    <div className="inline-flex items-center rounded-xl border border-[#d3dff1] bg-white shadow-[0_8px_22px_rgba(22,70,152,0.08)]">
      <button
        onClick={prev}
        className="rounded-l-xl border-r border-[#dbe5f4] p-2.5 text-[#56719c] transition-colors hover:bg-[#edf3ff] hover:text-[#0d2a5f]"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[150px] px-5 text-center text-sm font-semibold text-[#0d2a5f]">
        {MESES[mes - 1]} {anio}
      </span>
      <button
        onClick={next}
        className="rounded-r-xl border-l border-[#dbe5f4] p-2.5 text-[#56719c] transition-colors hover:bg-[#edf3ff] hover:text-[#0d2a5f]"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
