import { useState } from "react";
import type { DetallePlanillaAPI } from "../../pages/PlanillaPage";

export type TipoAjuste = "ADELANTO" | "DESCUENTO";
export type AjustePayload = {
  monto: number;
  descripcion: string;
  fechaAplicacion: string;
};

interface ModalAjusteProps {
  show: boolean;
  detalle: DetallePlanillaAPI;
  tipo: TipoAjuste;
  onSave: (payload: AjustePayload) => Promise<void>;
  onClose: () => void;
}

export default function ModalAjuste({
  show,
  detalle,
  tipo,
  onSave,
  onClose,
}: ModalAjusteProps) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || Number(monto) <= 0) {
      alert("Por favor, ingrese un monto válido.");
      return;
    }

    setIsSaving(true);
    await onSave({
      monto: Number(monto),
      descripcion,
      fechaAplicacion: new Date().toISOString(),
    });
    setIsSaving(false);
    // Limpiamos los campos y cerramos el modal
    setMonto("");
    setDescripcion("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">
          Registrar {tipo === "ADELANTO" ? "Adelanto" : "Descuento"} para{" "}
          {detalle.trabajador.nombres}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="monto"
              className="block text-sm font-medium text-slate-700"
            >
              Monto (S/)
            </label>
            <input
              id="monto"
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-slate-700"
            >
              Descripción (Opcional)
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
