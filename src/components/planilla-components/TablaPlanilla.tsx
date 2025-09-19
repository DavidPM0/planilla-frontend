import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  MinusCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { DetallePlanillaAPI } from "../../pages/PlanillaPage"; // Importamos el tipo

interface TablaPlanillaProps {
  detalles: DetallePlanillaAPI[];
  isLoading: boolean;
  error: string | null;
  onOpenHistorial: (detalle: DetallePlanillaAPI) => void;
  onOpenAjuste: (
    detalle: DetallePlanillaAPI,
    tipo: "ADELANTO" | "DESCUENTO"
  ) => void;
  onMarcarPago: (detalleId: number) => void;
}

export default function TablaPlanilla({
  detalles,
  isLoading,
  error,
  onOpenHistorial,
  onOpenAjuste,
  onMarcarPago,
}: TablaPlanillaProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPorPagina = 8;

  const totalPaginas = Math.ceil(detalles.length / itemsPorPagina);
  const startIndex = (currentPage - 1) * itemsPorPagina;
  const detallesPaginados = detalles.slice(
    startIndex,
    startIndex + itemsPorPagina
  );

  if (isLoading)
    return (
      <div className="text-center p-8 text-slate-500">Cargando planilla...</div>
    );
  if (error)
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  if (detalles.length === 0 && !isLoading)
    return (
      <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg">
        No hay datos para este período. Puede que necesites generar la planilla.
      </div>
    );

  return (
    <div className="bg-white shadow rounded-lg p-4 overflow-x-auto flex-1 flex flex-col">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Lista de empleados
      </h2>
      <div className="flex-grow">
        <table className="min-w-full text-sm text-left text-slate-600">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="px-4 py-3">Nombres y Apellidos</th>
              <th className="px-4 py-3">Monto Base</th>
              <th className="px-4 py-3">Total Ajustes</th>
              <th className="px-4 py-3">Neto a Pagar</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
              <th className="px-4 py-3 text-center">Historial</th>
            </tr>
          </thead>
          <tbody>
            {detallesPaginados.map((detalle, idx) => (
              <tr
                key={detalle.id}
                className={
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50 hover:bg-slate-100"
                }
              >
                <td className="px-4 py-2">
                  <div className="font-medium">{`${detalle.trabajador.nombres} ${detalle.trabajador.apellidos}`}</div>
                  <div className="text-xs text-slate-500">{`${detalle.trabajador.banco} - ${detalle.trabajador.numeroCuenta}`}</div>
                </td>
                <td className="px-4 py-2">
                  S/ {Number(detalle.montoBase).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-yellow-600">
                  S/ {Number(detalle.totalAjustes).toFixed(2)}
                </td>
                <td className="px-4 py-2 font-bold">
                  S/ {Number(detalle.montoFinalAPagar).toFixed(2)}
                </td>
                <td
                  className={`px-4 py-2 font-medium ${
                    detalle.estadoPago === "PAGADO"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {detalle.estadoPago}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => onOpenAjuste(detalle, "ADELANTO")}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs"
                    >
                      <BanknotesIcon className="w-4 h-4" /> Adelanto
                    </button>
                    <button
                      onClick={() => onOpenAjuste(detalle, "DESCUENTO")}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs"
                    >
                      <MinusCircleIcon className="w-4 h-4" /> Descuento
                    </button>
                    <button
                      onClick={() => onMarcarPago(detalle.id)}
                      disabled={detalle.estadoPago === "PAGADO"}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 text-xs disabled:opacity-50"
                    >
                      <CurrencyDollarIcon className="w-4 h-4" /> Pago
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => onOpenHistorial(detalle)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs"
                  >
                    <ClockIcon className="w-4 h-4" /> Ver historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-5 h-5" /> Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {currentPage} de {totalPaginas || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPaginas))}
            disabled={currentPage === totalPaginas || totalPaginas === 0}
            className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
          >
            Siguiente <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
