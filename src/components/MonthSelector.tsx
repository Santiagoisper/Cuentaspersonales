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
    <div className="inline-flex items-center rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)]">
      <button
        onClick={prev}
        className="rounded-l-xl border-r border-[var(--nn-border)] p-2.5 text-[var(--nn-text-muted)] transition-colors hover:bg-[var(--nn-primary-soft)] hover:text-[var(--nn-true-blue)]"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[150px] px-5 text-center text-sm font-semibold text-[var(--nn-true-blue)]">
        {MESES[mes - 1]} {anio}
      </span>
      <button
        onClick={next}
        className="rounded-r-xl border-l border-[var(--nn-border)] p-2.5 text-[var(--nn-text-muted)] transition-colors hover:bg-[var(--nn-primary-soft)] hover:text-[var(--nn-true-blue)]"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
