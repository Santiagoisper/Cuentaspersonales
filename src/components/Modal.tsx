"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2a5f]/35 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#d2def0] bg-white shadow-[0_24px_56px_rgba(14,45,102,0.24)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#dee7f5] px-6 py-5">
          <h2 className="text-lg font-bold tracking-tight text-[#0d2a5f]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#5d759d] transition-colors hover:bg-[#eef4ff] hover:text-[#0d2a5f]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
