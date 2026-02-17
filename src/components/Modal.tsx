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
    <div className="fixed inset-0 bg-[#0a2a66]/35 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-[#d7e4ff] w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in shadow-[0_18px_40px_rgba(22,80,199,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e5edff]">
          <h2 className="text-lg font-bold text-[#0a2a66]">{title}</h2>
          <button onClick={onClose} className="text-[#5a6f99] hover:text-[#1650c7] transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
