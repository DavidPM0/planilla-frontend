import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  MinusCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
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
  // Props de paginación
  currentPage?: number;
  lastPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onGoToPage?: (page: number) => void;
}

export default function TablaPlanilla({
  detalles,
  isLoading,
  error,
  onOpenHistorial,
  onOpenAjuste,
  onMarcarPago,
  // Props de paginación
  currentPage = 1,
  lastPage = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onNextPage,
  onPreviousPage,
  onGoToPage,
}: TablaPlanillaProps) {
  // Si se proporcionan props de paginación, usar paginación del servidor
  // Si no, usar paginación del cliente (comportamiento original)
  const useServerPagination = Boolean(
    onNextPage && onPreviousPage && onGoToPage
  );

  // Solo usar paginación del cliente si no hay paginación del servidor
  const [currentClientPage, setCurrentClientPage] = useState(1);
  const itemsPorPagina = 8;

  const totalPaginas = useServerPagination
    ? lastPage
    : Math.ceil(detalles.length / itemsPorPagina);

  const currentDisplayPage = useServerPagination
    ? currentPage
    : currentClientPage;

  const detallesPaginados = useServerPagination
    ? detalles // Los datos ya vienen paginados del servidor
    : detalles.slice(
        (currentClientPage - 1) * itemsPorPagina,
        currentClientPage * itemsPorPagina
      );

  // Efectos para resetear la paginación del cliente cuando cambian los datos
  useEffect(() => {
    if (!useServerPagination) {
      setCurrentClientPage(1);
    }
  }, [detalles.length, useServerPagination]);

  if (isLoading)
    return (
      <div className="text-center p-8 text-slate-500">Cargando planilla...</div>
    );
  if (error)
    return (
      <div className="text-center p-8 text-red-500 bg-red-50">{error}</div>
    );
  if (detalles.length === 0 && !isLoading)
    return (
      <div className="text-center p-8 text-slate-500 bg-slate-50">
        No hay datos para este período. Puede que necesites generar la planilla.
      </div>
    );

  return (
    <div className="overflow-x-auto flex-1 flex flex-col">
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
                      disabled={detalle.estadoPago === "PAGADO"}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BanknotesIcon className="w-4 h-4" /> Adelanto
                    </button>
                    <button
                      onClick={() => onOpenAjuste(detalle, "DESCUENTO")}
                      disabled={detalle.estadoPago === "PAGADO"}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Paginación */}
      {
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              if (useServerPagination && onPreviousPage) {
                onPreviousPage();
              } else {
                setCurrentClientPage((p) => Math.max(p - 1, 1));
              }
            }}
            disabled={
              useServerPagination ? !hasPreviousPage : currentDisplayPage === 1
            }
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeftIcon className="w-4 h-4" /> Anterior
          </button>
          <span className="text-sm text-slate-700 font-medium bg-white px-3 py-1 rounded-md border border-slate-200">
            Página {currentDisplayPage} de {totalPaginas || 1}
          </span>
          <button
            onClick={() => {
              if (useServerPagination && onNextPage) {
                onNextPage();
              } else {
                setCurrentClientPage((p) => Math.min(p + 1, totalPaginas));
              }
            }}
            disabled={
              useServerPagination
                ? !hasNextPage
                : currentDisplayPage === totalPaginas || totalPaginas === 0
            }
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Siguiente <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      }
    </div>
  );
}
