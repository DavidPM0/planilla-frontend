import { useState, useEffect } from "react";
import useFetchApi from "../../hooks/use-fetch";
import type { DetallePlanillaAPI } from "../../pages/PlanillaPage";

type AjusteAPI = {
  id: number;
  tipo: string;
  monto: number;
  descripcion: string;
  fechaAplicacion: string;
};

interface ModalHistorialProps {
  show: boolean;
  detalle: DetallePlanillaAPI;
  onClose: () => void;
}

export default function ModalHistorial({
  show,
  detalle,
  onClose,
}: ModalHistorialProps) {
  const { get } = useFetchApi();
  const [ajustes, setAjustes] = useState<AjusteAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (show) {
      setIsLoading(true);
      get<AjusteAPI[]>(`/planillas/detalles/${detalle.id}/ajustes`)
        .then((data) => setAjustes(data))
        .catch(() => setAjustes([])) // Manejar error
        .finally(() => setIsLoading(false));
    }
  }, [show, detalle.id, get]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-3 text-slate-700">
          Historial de {detalle.trabajador.nombres}{" "}
          {detalle.trabajador.apellidos}
        </h3>
        {isLoading ? (
          <p>Cargando historial...</p>
        ) : ajustes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sin movimientos registrados para este mes.
          </p>
        ) : (
          <ul className="divide-y max-h-64 overflow-y-auto">
            {ajustes.map((h) => (
              <li key={h.id} className="py-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    <strong>{h.tipo}</strong> — S/ {Number(h.monto).toFixed(2)}
                    {h.descripcion && ` (${h.descripcion})`}
                  </span>
                  <span className="text-slate-500">
                    {new Date(h.fechaAplicacion).toLocaleDateString("es-PE")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
