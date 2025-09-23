interface MarcarPagoDialogProps {
  show: boolean;
  trabajadorNombre?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MarcarPagoDialog({
  show,
  trabajadorNombre,
  onConfirm,
  onCancel,
}: MarcarPagoDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Confirmar Pago
        </h2>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <span className="text-green-500 text-2xl">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-slate-600">
                ¿Está seguro de que desea marcar este pago como{" "}
                <span className="font-semibold text-green-600">realizado</span>?
              </p>
              {trabajadorNombre && (
                <p className="text-sm text-slate-500 mt-1">
                  Trabajador:{" "}
                  <span className="font-medium">{trabajadorNombre}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-500 text-lg">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Esta acción registrará el pago como completado y se reflejará
                  en los reportes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md font-medium transition"
          >
            Marcar como Pagado
          </button>
        </div>
      </div>
    </div>
  );
}
