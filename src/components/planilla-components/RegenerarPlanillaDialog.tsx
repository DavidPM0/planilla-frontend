import { useState } from "react";

interface RegenerarPlanillaDialogProps {
  show: boolean;
  planilla: {
    id: number;
    mes: number;
    anio: number;
    periodo: number;
  } | null;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

export default function RegenerarPlanillaDialog({
  show,
  planilla,
  onConfirm,
  onCancel,
}: RegenerarPlanillaDialogProps) {
  const [motivo, setMotivo] = useState("");

  if (!show || !planilla) return null;

  const tipoPlanilla =
    planilla.periodo === 0
      ? "Mensual"
      : planilla.periodo === 1
      ? "Primera Quincena"
      : "Segunda Quincena";

  const handleConfirm = () => {
    if (motivo.trim()) {
      onConfirm(motivo.trim());
      setMotivo(""); // Limpiar el motivo después de confirmar
    }
  };

  const handleCancel = () => {
    setMotivo(""); // Limpiar el motivo al cancelar
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Regenerar Planilla
        </h2>

        <div className="mb-4">
          <p className="text-slate-600 mb-2">
            ¿Desea <span className="font-semibold">REGENERAR</span> la planilla{" "}
            <span className="font-semibold text-indigo-600">
              {tipoPlanilla}
            </span>{" "}
            de{" "}
            <span className="font-semibold">
              {planilla.mes}/{planilla.anio}
            </span>
            ?
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-amber-500 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <strong>ATENCIÓN:</strong> Esto reemplazará completamente la
                  planilla actual con nuevos cálculos.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Motivo de la regeneración <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo por el cual se regenera la planilla..."
              className="w-full border border-slate-300 rounded-md p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!motivo.trim()}
            className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md font-medium transition"
          >
            Regenerar Planilla
          </button>
        </div>
      </div>
    </div>
  );
}
