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
  { href: "/resumen", label: "Resumen General", icon: Table2 },
  { href: "/activos", label: "Activos e Inversiones", icon: Landmark },
  { href: "/dolares", label: "Dolares", icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl border border-[#d7e4ff] bg-white text-[#0a2a66] shadow-sm lg:hidden"
        aria-label="Abrir menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <button
          type="button"
          aria-label="Cerrar menu"
          className="fixed inset-0 bg-[#0a2a66]/25 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-[#d7e4ff] z-40 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-[#e5edff]">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[#eaf2ff] text-[#1650c7]">
            PFIZER STYLE
          </div>
          <h1 className="text-xl font-bold text-[#0a2a66] mt-3">Cuentas Personales</h1>
          <p className="text-sm text-[#5a6f99] mt-1">Panel financiero</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#1650c7] text-white shadow-[0_8px_20px_rgba(22,80,199,0.25)]"
                    : "text-[#33538f] hover:bg-[#eef4ff]"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

