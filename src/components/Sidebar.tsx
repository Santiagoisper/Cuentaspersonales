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
  { href: "/egresos", label: "Egresos", icon: TrendingDown },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/resumen", label: "Resumen", icon: Table2 },
  { href: "/activos", label: "Activos", icon: Landmark },
  { href: "/dolares", label: "Dolares", icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#cfdcf0] bg-white/92 backdrop-blur-lg">
      <div className="h-1 bg-gradient-to-r from-[#0d2a5f] via-[#1652c4] to-[#4b86f5]" />

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d2a5f] shadow-[0_10px_24px_rgba(13,42,95,0.24)]">
            <span className="text-sm font-black tracking-wide text-white">CP</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5f769d]">Personal Finance</p>
            <p className="text-base font-semibold text-[#0d2a5f]">Cuentas Personales</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1652c4] text-white shadow-[0_8px_22px_rgba(22,82,196,0.33)]"
                    : "text-[#4b638f] hover:bg-[#edf3ff] hover:text-[#0d2a5f]"
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl border border-[#d4e1f3] p-2 text-[#3e5d8f] transition-colors hover:bg-[#edf3ff] md:hidden"
          aria-label="Abrir menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#d9e4f4] bg-white px-4 py-4 md:hidden">
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
  );
}
