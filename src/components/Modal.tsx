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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--nn-true-blue)]/20 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--nn-border)] bg-[var(--nn-snow-white)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--nn-border)] px-6 py-5">
          <h2 className="text-lg font-bold tracking-tight text-[var(--nn-true-blue)]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--nn-text-muted)] transition-colors hover:bg-[var(--nn-primary-soft)] hover:text-[var(--nn-true-blue)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
