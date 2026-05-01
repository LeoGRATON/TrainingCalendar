import { X } from "lucide-react";
import type { TModalCreateSession } from "../types/interfaces";

export default function Modal({ onClose, children }: TModalCreateSession) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold">Ajouter une séance</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
