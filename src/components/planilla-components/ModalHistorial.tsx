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
        ) : (
          <>
            {ajustes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Sin ajustes registrados para este mes.
              </p>
            ) : (
              <div>
                <h4 className="text-md font-medium mb-2 text-slate-600">
                  Ajustes realizados:
                </h4>
                <ul className="divide-y max-h-48 overflow-y-auto mb-4">
                  {ajustes.map((h) => (
                    <li key={h.id} className="py-2 text-sm">
                      <div className="flex justify-between">
                        <span>
                          <strong>{h.tipo}</strong> — S/{" "}
                          {Number(h.monto).toFixed(2)}
                          {h.descripcion && ` (${h.descripcion})`}
                        </span>
                        <span className="text-slate-500">
                          {new Date(h.fechaAplicacion).toLocaleDateString(
                            "es-PE"
                          )}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información de estado de pago */}
            <div className="bg-slate-50 p-3 rounded-md">
              <h4 className="text-md font-medium mb-2 text-slate-600">
                Estado de pago:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Estado actual:</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      detalle.estadoPago === "PAGADO"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {detalle.estadoPago}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Monto base del período:</span>
                  <span className="font-medium">
                    S/ {Number(detalle.montoBase).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Total de ajustes:</span>
                  <span
                    className={`font-medium ${
                      (detalle.totalAjustes || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    S/ {Number(detalle.totalAjustes || 0).toFixed(2)}
                  </span>
                </div>

                {detalle.estadoPago === "PENDIENTE" ? (
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Pendiente de pago:</span>
                    <span className="font-semibold text-red-600">
                      S/ {Number(detalle.montoFinalAPagar).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total pagado:</span>
                      <span className="font-semibold text-green-600">
                        S/ {Number(detalle.montoBase).toFixed(2)}
                      </span>
                    </div>
                    {detalle.fechaPago && (
                      <div className="flex justify-between">
                        <span>Fecha de pago:</span>
                        <span className="font-medium">
                          {new Date(detalle.fechaPago).toLocaleDateString(
                            "es-PE",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Fecha programada:</span>
                  <span>
                    {new Date(detalle.fechaAPagar).toLocaleDateString("es-PE")}
                  </span>
                </div>
              </div>
            </div>
          </>
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
