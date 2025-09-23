interface CambiarEstadoPlanillaDialogProps {
  show: boolean;
  planilla: {
    id: number;
    mes: number;
    anio: number;
    periodo: number;
  } | null;
  nuevoEstado: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CambiarEstadoPlanillaDialog({
  show,
  planilla,
  nuevoEstado,
  onConfirm,
  onCancel,
}: CambiarEstadoPlanillaDialogProps) {
  if (!show || !planilla) return null;

  const estadoTexto =
    nuevoEstado === "PROCESADA" ? "procesar" : "marcar como pagada";

  const estadoColor = nuevoEstado === "PROCESADA" ? "blue" : "green";
  const estadoIcon = nuevoEstado === "PROCESADA" ? "⚡" : "✅";

  const tipoPlanilla =
    planilla.periodo === 0
      ? "Mensual"
      : planilla.periodo === 1
      ? "Primera Quincena"
      : "Segunda Quincena";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Cambiar Estado de Planilla
        </h2>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <span className="text-2xl">{estadoIcon}</span>
            </div>
            <div className="ml-3">
              <p className="text-slate-600">
                ¿Está seguro de{" "}
                <span
                  className={`font-semibold ${
                    estadoColor === "blue" ? "text-blue-600" : "text-green-600"
                  }`}
                >
                  {estadoTexto}
                </span>{" "}
                esta planilla?
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Planilla {tipoPlanilla} de {planilla.mes}/{planilla.anio}
              </p>
            </div>
          </div>

          <div
            className={`${
              estadoColor === "blue"
                ? "bg-blue-50 border-blue-200"
                : "bg-green-50 border-green-200"
            } border rounded-md p-3`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span
                  className={`${
                    estadoColor === "blue" ? "text-blue-500" : "text-green-500"
                  } text-lg`}
                >
                  ℹ️
                </span>
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    estadoColor === "blue" ? "text-blue-700" : "text-green-700"
                  }`}
                >
                  {nuevoEstado === "PROCESADA"
                    ? "La planilla pasará al estado PROCESADA y estará lista para pagos."
                    : "La planilla se marcará como PAGADA y se completará el proceso."}
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
            className={`px-4 py-2 text-white rounded-md font-medium transition ${
              estadoColor === "blue"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {nuevoEstado === "PROCESADA"
              ? "Procesar Planilla"
              : "Marcar como Pagada"}
          </button>
        </div>
      </div>
    </div>
  );
}
