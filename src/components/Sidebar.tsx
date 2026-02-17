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
      <header className="sticky top-0 z-40 border-b border-[#cfdcf0] bg-white/95 backdrop-blur md:hidden">
        <div className="h-1 bg-gradient-to-r from-[#0d2a5f] via-[#1652c4] to-[#4b86f5]" />
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2a5f] shadow-[0_10px_24px_rgba(13,42,95,0.24)]">
              <span className="text-sm font-black tracking-wide text-white">CP</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5f769d]">Personal Finance</p>
              <p className="text-sm font-semibold text-[#0d2a5f]">Cuentas Personales</p>
            </div>
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl border border-[#d4e1f3] p-2 text-[#3e5d8f] transition-colors hover:bg-[#edf3ff]"
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-[#d9e4f4] bg-white px-4 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#1652c4] text-white"
                        : "text-[#486389] hover:bg-[#edf3ff] hover:text-[#0d2a5f]"
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

      <aside className="fixed right-0 top-0 bottom-0 z-30 hidden w-64 border-l border-[#d4e1f3] bg-white/95 px-4 py-6 backdrop-blur md:flex md:flex-col">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d2a5f] shadow-[0_10px_24px_rgba(13,42,95,0.24)]">
            <span className="text-sm font-black tracking-wide text-white">CP</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5f769d]">Personal Finance</p>
            <p className="text-base font-semibold text-[#0d2a5f]">Cuentas Personales</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1652c4] text-white shadow-[0_8px_22px_rgba(22,82,196,0.33)]"
                    : "text-[#4b638f] hover:bg-[#edf3ff] hover:text-[#0d2a5f]"
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
