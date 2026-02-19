"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Table2,
  Landmark,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/egresos", label: "Egresos", icon: TrendingDown },
  { href: "/resumen", label: "Resumen", icon: Table2 },
  { href: "/activos", label: "Activos", icon: Landmark },
  { href: "/dolares", label: "Dolares", icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--nn-border)] bg-[var(--nn-snow-white)] md:hidden">
        <div className="h-0.5 bg-[var(--nn-true-blue)]" />
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--nn-true-blue)]">
              <span className="text-sm font-bold tracking-wide text-[var(--nn-snow-white)]">CP</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--nn-text-muted)]">Personal Finance</p>
              <p className="text-sm font-semibold text-[var(--nn-true-blue)]">Cuentas Personales</p>
            </div>
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-[var(--nn-border)] p-2 text-[var(--nn-text-muted)] transition-colors hover:bg-[var(--nn-primary-soft)]"
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-[var(--nn-border)] bg-[var(--nn-snow-white)] px-4 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--nn-true-blue)] text-[var(--nn-snow-white)]"
                        : "text-[var(--nn-text-muted)] hover:bg-[var(--nn-primary-soft)] hover:text-[var(--nn-true-blue)]"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <aside className="fixed right-0 top-0 bottom-0 z-30 hidden w-64 border-l border-[var(--nn-border)] bg-[var(--nn-snow-white)] px-4 py-6 md:flex md:flex-col">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--nn-true-blue)]">
            <span className="text-sm font-bold tracking-wide text-[var(--nn-snow-white)]">CP</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--nn-text-muted)]">Personal Finance</p>
            <p className="text-base font-semibold text-[var(--nn-true-blue)]">Cuentas Personales</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--nn-true-blue)] text-[var(--nn-snow-white)]"
                    : "text-[var(--nn-text-muted)] hover:bg-[var(--nn-primary-soft)] hover:text-[var(--nn-true-blue)]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
