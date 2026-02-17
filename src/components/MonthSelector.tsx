"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface MonthSelectorProps {
  mes: number;
  anio: number;
  onChange: (mes: number, anio: number) => void;
}

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
    <div className="flex items-center gap-4">
      <button
        onClick={prev}
        className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-lg font-semibold min-w-[180px] text-center">
        {MESES[mes - 1]} {anio}
      </span>
      <button
        onClick={next}
        className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
