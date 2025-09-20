import { useCallback, useEffect, useState, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  MinusCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import FiltrosPlanilla from "../components/planilla-components/FiltrosPlanilla";
import ModalAjuste, {
  type AjustePayload,
  type TipoAjuste,
} from "../components/planilla-components/ModalAjuste";
import ModalHistorial from "../components/planilla-components/ModalHistorial";
import useFetchApi from "../hooks/use-fetch";
import { usePaginationQuery } from "../hooks/use-pagination-query";
import { toast } from "sonner";

// Helper function for consistent error handling
const getErrorMessage = (err: any, defaultMessage: string): string => {
  // Para errores 404 específicos de planillas, no mostrar como error crítico
  if (
    err?.response?.status === 404 &&
    err?.response?.data?.message?.includes("No se encontraron planillas")
  ) {
    return `ℹ️ ${err.response.data.message}`;
  }

  const errorMessage =
    err?.response?.data?.message || err?.message || defaultMessage;
  console.error("API Error:", err);
  return `❌ Error: ${errorMessage}`;
};

// Helper function for operations that might fail gracefully
const handleOperationWithToast = async (
  operation: () => Promise<any>,
  messages: {
    loading: string;
    success: string;
    defaultError: string;
  }
) => {
  const operationPromise = operation();

  toast.promise(operationPromise, {
    loading: messages.loading,
    success: () => `✅ ${messages.success}`,
    error: (err) => getErrorMessage(err, messages.defaultError),
  });

  return operationPromise;
};

// Helper function to create specific planilla types
const createSpecificPlanilla = async (
  periodo: number,
  mes: number,
  anio: number,
  post: any,
  refreshPlanillasPreservingSelection: () => Promise<void>,
  refreshDetalles: () => void
) => {
  const endpoints = {
    0: "/planillas/procesar-mensual",
    1: "/planillas/procesar-primera-quincena",
    2: "/planillas/procesar-segunda-quincena",
  };

  const nombres = {
    0: "Mensual",
    1: "Primera Quincena",
    2: "Segunda Quincena",
  };

  const endpoint = endpoints[periodo as keyof typeof endpoints];
  const nombre = nombres[periodo as keyof typeof nombres];

  if (!endpoint) {
    throw new Error(`Período no válido: ${periodo}`);
  }

  await post(endpoint, { mes, anio });
  await refreshPlanillasPreservingSelection();
  refreshDetalles(); // Refrescar también los detalles paginados
  return `Planilla ${nombre} creada exitosamente`;
};

export type DetallePlanillaAPI = {
  id: number;
  montoBase: number;
  montoCalculado: number;
  totalAjustes: number;
  montoFinalAPagar: number;
  estadoPago: "PENDIENTE" | "PAGADO";
  fechaAPagar: string;
  fechaPago?: string; // Cuándo se marcó como pagado (opcional)
  trabajador: {
    id: number;
    nombres: string;
    apellidos: string;
    banco: string;
    numeroCuenta: string;
  };
  // Nuevo campo opcional para información de la planilla cuando se usa paginación
  planilla?: {
    id: number;
    periodo: number;
    descripcion: string;
  };
};

export type PlanillaAPI = {
  planilla: {
    id: number;
    mes: number;
    anio: number;
    periodo: number;
    fechaInicio: string;
    fechaFin: string;
    montoTotal: number;
    estado: "GENERADA" | "PROCESADA" | "PAGADA";
    descripcion: string;
  };
  detalles: DetallePlanillaAPI[];
};

export default function PlanillaPage() {
  const { get, post, patch } = useFetchApi();
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [isLoading, setIsLoading] = useState(true);

  const [planillas, setPlanillas] = useState<PlanillaAPI[]>([]);
  const [planillaSeleccionada, setPlanillaSeleccionada] =
    useState<PlanillaAPI | null>(null);

  // Ref para mantener siempre la referencia más actual de la planilla seleccionada
  const planillaSeleccionadaRef = useRef<PlanillaAPI | null>(null);

  // Actualizar ref cada vez que cambie la selección
  useEffect(() => {
    planillaSeleccionadaRef.current = planillaSeleccionada;
  }, [planillaSeleccionada]);

  const [historialVisible, setHistorialVisible] =
    useState<DetallePlanillaAPI | null>(null);
  const [ajusteVisible, setAjusteVisible] = useState<{
    detalle: DetallePlanillaAPI;
    tipo: TipoAjuste;
  } | null>(null);

  // Hook de paginación para los detalles de planilla
  const {
    data: detallesPaginados,
    isLoading: isLoadingDetalles,
    error: errorDetalles,
    search: busqueda,
    setSearch: setBusqueda,
    currentPage,
    lastPage,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    refresh: refreshDetalles,
  } = usePaginationQuery<DetallePlanillaAPI>("/planillas/detalles-paginados", {
    limit: 2,
    initialSearch: "",
    additionalParams: {
      anio: selectedYear,
      mes: selectedMonth,
      // Solo filtrar por período si hay una planilla seleccionada
      ...(planillaSeleccionada && {
        periodo: planillaSeleccionada.planilla.periodo,
      }),
    },
  });

  const fetchPlanilla = useCallback(async () => {
    setIsLoading(true);
    setPlanillas([]);
    try {
      const params = new URLSearchParams({
        anio: selectedYear.toString(),
        mes: selectedMonth.toString(),
      });

      const data = await get<PlanillaAPI[]>(
        `/planillas/detalles?${params.toString()}`
      );

      setPlanillas(data);

      // Seleccionar la primera planilla por defecto
      if (data.length > 0) {
        setPlanillaSeleccionada(data[0]);
      } else {
        setPlanillaSeleccionada(null);
      }
    } catch (err: any) {
      console.error("Error fetching planillas:", err);
      if (err.response?.status === 404) {
        setPlanillas([]);
        setPlanillaSeleccionada(null);
      } else {
        console.error(
          "Error al cargar las planillas:",
          err.response?.data?.message || err.message
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [get, selectedYear, selectedMonth]);

  // Nueva función que actualiza datos pero mantiene selección
  const refreshPlanillasPreservingSelection = useCallback(async () => {
    // Usar el ref para obtener el valor más actual
    const currentPeriodo = planillaSeleccionadaRef.current?.planilla.periodo;
    console.log("🔍 Preserving selection - Current periodo:", currentPeriodo);
    console.log(
      "🔍 Current planilla:",
      planillaSeleccionadaRef.current?.planilla.descripcion
    );

    try {
      const params = new URLSearchParams({
        anio: selectedYear.toString(),
        mes: selectedMonth.toString(),
      });

      const data = await get<PlanillaAPI[]>(
        `/planillas/detalles?${params.toString()}`
      );

      console.log(
        "📋 Available planillas after refresh:",
        data.map((p) => ({
          id: p.planilla.id,
          periodo: p.planilla.periodo,
          descripcion: p.planilla.descripcion,
        }))
      );

      setPlanillas(data);

      // Intentar mantener la misma planilla seleccionada por período
      if (currentPeriodo !== undefined && data.length > 0) {
        const planillaConMismoPeriodo = data.find(
          (p) => p.planilla.periodo === currentPeriodo
        );
        console.log(
          "🎯 Found planilla with same periodo:",
          planillaConMismoPeriodo?.planilla.descripcion
        );

        if (planillaConMismoPeriodo) {
          setPlanillaSeleccionada(planillaConMismoPeriodo);
          console.log(
            "✅ Selection preserved:",
            planillaConMismoPeriodo.planilla.descripcion
          );
        } else {
          // Si no existe la planilla del mismo período, seleccionar la primera
          setPlanillaSeleccionada(data[0]);
          console.log(
            "⚠️ Fallback to first planilla:",
            data[0].planilla.descripcion
          );
        }
      } else if (data.length > 0) {
        // Si no había selección previa, seleccionar la primera
        setPlanillaSeleccionada(data[0]);
        console.log(
          "🆕 No previous selection, selecting first:",
          data[0].planilla.descripcion
        );
      } else {
        setPlanillaSeleccionada(null);
        console.log("❌ No planillas available");
      }
    } catch (err: any) {
      console.error("Error refreshing planillas:", err);
      throw err; // Re-lanzar el error para que el toast lo maneje
    }
  }, [get, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchPlanilla();
  }, [fetchPlanilla]);

  const handleRegenerarPlanilla = async () => {
    if (!planillaSeleccionada) {
      toast.error("Debe seleccionar una planilla para regenerar");
      return;
    }

    const motivo = window.prompt(
      "Ingrese el motivo de la regeneración:",
      "Corrección por actualización de datos"
    );

    if (!motivo || motivo.trim() === "") {
      toast.error("Debe proporcionar un motivo para la regeneración");
      return;
    }

    const planilla = planillaSeleccionada.planilla;
    const tipoPlanilla =
      planilla.periodo === 0
        ? "Mensual"
        : planilla.periodo === 1
        ? "Primera Quincena"
        : "Segunda Quincena";

    if (
      !window.confirm(
        `¿Desea REGENERAR la planilla ${tipoPlanilla} de ${planilla.mes}/${planilla.anio}?\n\nMotivo: ${motivo}\n\n⚠️ ATENCIÓN: Esto reemplazará completamente la planilla actual con nuevos cálculos.`
      )
    )
      return;

    await handleOperationWithToast(
      async () => {
        const response: any = await post(
          `/planillas/regenerar/${planilla.id}`,
          {
            motivoReemplazo: motivo,
          }
        );
        await refreshPlanillasPreservingSelection();
        refreshDetalles(); // Refrescar también los detalles paginados
        return response?.mensaje || "Planilla regenerada correctamente";
      },
      {
        loading: "Regenerando planilla...",
        success: "Planilla regenerada correctamente",
        defaultError: "No se pudo regenerar la planilla.",
      }
    );
  };

  const handleGuardarAjuste = async (payload: Omit<AjustePayload, "tipo">) => {
    if (!ajusteVisible) return;
    const { detalle, tipo } = ajusteVisible;

    await handleOperationWithToast(
      async () => {
        await post(`/planillas/detalles/${detalle.id}/ajustes`, {
          ...payload,
          tipo,
        });
        setAjusteVisible(null);
        await refreshPlanillasPreservingSelection(); // Mantener selección
        refreshDetalles(); // Refrescar también los detalles paginados
        return "Ajuste guardado exitosamente";
      },
      {
        loading: "Guardando ajuste...",
        success: "Ajuste guardado exitosamente!",
        defaultError: "No se pudo guardar el ajuste.",
      }
    );
  };

  const handleMarcarPago = async (detalleId: number) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea marcar este pago como realizado?"
      )
    )
      return;

    await handleOperationWithToast(
      async () => {
        await patch(`/planillas/detalles/${detalleId}/pagar`, {});
        await refreshPlanillasPreservingSelection(); // Mantener selección
        refreshDetalles(); // Refrescar también los detalles paginados
        return "Pago registrado exitosamente";
      },
      {
        loading: "Registrando pago...",
        success: "Pago registrado exitosamente!",
        defaultError: "No se pudo actualizar el estado del pago.",
      }
    );
  };

  const handleCambiarEstado = async (
    planillaId: number,
    nuevoEstado: string
  ) => {
    const estadoTexto =
      nuevoEstado === "PROCESADA" ? "procesar" : "marcar como pagada";

    if (!window.confirm(`¿Está seguro de ${estadoTexto} esta planilla?`)) {
      return;
    }

    await handleOperationWithToast(
      async () => {
        await patch(`/planillas/${planillaId}/estado`, { estado: nuevoEstado });
        await refreshPlanillasPreservingSelection();
        refreshDetalles(); // Refrescar también los detalles paginados
        return `Planilla ${estadoTexto
          .replace("procesar", "procesada")
          .replace("marcar como pagada", "marcada como pagada")} exitosamente`;
      },
      {
        loading: `${
          nuevoEstado === "PROCESADA" ? "Procesando" : "Actualizando"
        } planilla...`,
        success: `Planilla ${estadoTexto
          .replace("procesar", "procesada")
          .replace("marcar como pagada", "marcada como pagada")} exitosamente!`,
        defaultError: `Error al ${estadoTexto} la planilla`,
      }
    );
  };

  // Helper functions para validar si se pueden hacer ajustes
  const puedeHacerAdelanto = (detalle: DetallePlanillaAPI): boolean => {
    // No se puede hacer adelanto si ya está pagado
    if (detalle.estadoPago === "PAGADO") return false;

    // Lógica simple: Si el monto final a pagar es mayor que 0,
    // significa que aún no se ha adelantado todo el monto base
    // Esta es una aproximación conservadora
    return (detalle.montoFinalAPagar || 0) > 0;
  };

  const puedeHacerDescuento = (detalle: DetallePlanillaAPI): boolean => {
    // No se puede hacer descuento si ya está pagado
    if (detalle.estadoPago === "PAGADO") return false;

    // Solo se puede hacer descuento si hay monto final a pagar
    return (detalle.montoFinalAPagar || 0) > 0;
  };

  return (
    <div className="p-6 bg-[#f9fafb] flex flex-col space-y-6 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Planilla</h1>
        <p className="text-slate-600 text-sm mb-4">
          Gestiona empleados, bancos y movimientos de pago.
        </p>
      </div>

      <FiltrosPlanilla
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        isLoading={isLoading}
      />

      {/* Selector de Planillas - Siempre mostrar los 3 períodos */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Planillas del Período
          </h3>
          <button
            onClick={() => setPlanillaSeleccionada(null)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
              !planillaSeleccionada
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
            }`}
          >
            📊 Ver todas las planillas
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Definir los 3 períodos posibles */}
          {[
            {
              periodo: 0,
              nombre: "Mensual",
              descripcion: "Empleados Mensuales",
            },
            {
              periodo: 1,
              nombre: "Primera Quincena",
              descripcion: "Primera Quincena",
            },
            {
              periodo: 2,
              nombre: "Segunda Quincena",
              descripcion: "Segunda Quincena",
            },
          ].map((periodoInfo) => {
            // Buscar si existe planilla para este período
            const planillaExistente = planillas.find(
              (p) => p.planilla.periodo === periodoInfo.periodo
            );

            return (
              <div
                key={periodoInfo.periodo}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  planillaExistente
                    ? planillaSeleccionada?.planilla.id ===
                      planillaExistente.planilla.id
                      ? "border-indigo-500 bg-indigo-50 cursor-pointer"
                      : "border-slate-200 hover:border-slate-300 cursor-pointer"
                    : "border-dashed border-slate-300 bg-slate-50"
                }`}
                onClick={() =>
                  planillaExistente &&
                  setPlanillaSeleccionada(planillaExistente)
                }
              >
                {planillaExistente ? (
                  // Planilla existente
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">
                        {periodoInfo.nombre}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          planillaExistente.planilla.estado === "PAGADA"
                            ? "bg-green-100 text-green-800"
                            : planillaExistente.planilla.estado === "PROCESADA"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        GENERADA
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>
                        📅{" "}
                        {planillaExistente.planilla.fechaInicio
                          ? new Date(
                              planillaExistente.planilla.fechaInicio
                            ).toLocaleDateString("es-PE")
                          : "N/A"}{" "}
                        -{" "}
                        {planillaExistente.planilla.fechaFin
                          ? new Date(
                              planillaExistente.planilla.fechaFin
                            ).toLocaleDateString("es-PE")
                          : "N/A"}
                      </p>
                      <p>
                        💰 Total: S/{" "}
                        {Number(
                          planillaExistente.planilla.montoTotal || 0
                        ).toFixed(2)}
                      </p>
                      <p>
                        👥 Empleados: {planillaExistente.detalles?.length || 0}
                      </p>
                    </div>

                    {/* Botones de acción para planillas existentes */}
                    <div className="mt-3 flex gap-2">
                      {planillaExistente.planilla.estado === "GENERADA" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCambiarEstado(
                              planillaExistente.planilla.id,
                              "PROCESADA"
                            );
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Procesar
                        </button>
                      )}
                      {planillaExistente.planilla.estado === "PROCESADA" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCambiarEstado(
                              planillaExistente.planilla.id,
                              "PAGADA"
                            );
                          }}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Marcar Pagada
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  // Planilla no existe - mostrar opción para crear
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-500">
                        {periodoInfo.nombre}
                      </h4>
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-slate-200 text-slate-600">
                        NO GENERADA
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1 mb-3">
                      <p>📅 {periodoInfo.descripcion}</p>
                      <p>💰 Total: S/ 0.00</p>
                      <p>👥 Empleados: 0</p>
                    </div>

                    {/* Botón para crear planilla faltante */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();

                        await handleOperationWithToast(
                          async () => {
                            return await createSpecificPlanilla(
                              periodoInfo.periodo,
                              selectedMonth,
                              selectedYear,
                              post,
                              refreshPlanillasPreservingSelection,
                              refreshDetalles
                            );
                          },
                          {
                            loading: `Creando planilla ${periodoInfo.nombre}...`,
                            success: `Planilla ${periodoInfo.nombre} creada exitosamente!`,
                            defaultError: `Error al crear la planilla ${periodoInfo.nombre}`,
                          }
                        );
                      }}
                      className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Crear {periodoInfo.nombre}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Regenerar Planilla - Solo cuando hay una planilla seleccionada */}
      {planillaSeleccionada && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            🔄 Opciones de Planilla Seleccionada
          </h3>
          <button
            onClick={handleRegenerarPlanilla}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
          >
            🔄 Regenerar Planilla
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Regenera la planilla seleccionada "
            {planillaSeleccionada.planilla.periodo === 0
              ? "Mensual"
              : planillaSeleccionada.planilla.periodo === 1
              ? "Primera Quincena"
              : "Segunda Quincena"}
            " con cálculos actualizados
          </p>
        </div>
      )}

      {/* Lista de Empleados con tabla integrada */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Header con título y búsqueda */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="text-md font-semibold text-slate-700">
                Lista de Empleados
                {planillaSeleccionada && (
                  <span className="text-base font-normal text-slate-600 ml-2">
                    •{" "}
                    {planillaSeleccionada.planilla.descripcion ||
                      (planillaSeleccionada.planilla.periodo === 0
                        ? "Mensual"
                        : planillaSeleccionada.planilla.periodo === 1
                        ? "Primera Quincena"
                        : "Segunda Quincena")}
                  </span>
                )}
                {!planillaSeleccionada && (
                  <span className="text-base font-normal text-slate-600 ml-2">
                    • Todas las planillas
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedMonth}/{selectedYear}
              </p>
            </div>
            <div className="w-full sm:w-80">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  disabled={isLoadingDetalles}
                  placeholder="Buscar por nombre, apellidos o número de cuenta..."
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla integrada */}
        {isLoadingDetalles ? (
          <p className="text-center py-4">Cargando...</p>
        ) : errorDetalles ? (
          <p className="text-red-500 text-center py-4">{errorDetalles}</p>
        ) : detallesPaginados.length === 0 ? (
          <p className="text-center py-4 text-slate-500">
            No hay datos para este período. Puede que necesites generar la
            planilla.
          </p>
        ) : (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-slate-600">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-4 py-3">Nombres y Apellidos</th>
                    <th className="px-4 py-3">Banco y Cuenta</th>
                    <th className="px-4 py-3">Monto Base</th>
                    <th className="px-4 py-3">Total Ajustes</th>
                    <th className="px-4 py-3">Neto a Pagar</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                    <th className="px-4 py-3 text-center">Historial</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesPaginados.map((detalle) => (
                    <tr key={detalle.id}>
                      <td className="px-4 py-2">
                        {detalle.trabajador.nombres}{" "}
                        {detalle.trabajador.apellidos}
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm">
                          <div className="font-medium text-slate-700">
                            {detalle.trabajador.banco || "Sin banco"}
                          </div>
                          <div className="text-slate-500">
                            {detalle.trabajador.numeroCuenta || "Sin cuenta"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        S/ {Number(detalle.montoBase || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`font-medium ${
                            (detalle.totalAjustes || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          S/ {Number(detalle.totalAjustes || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        S/ {Number(detalle.montoFinalAPagar || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            detalle.estadoPago === "PAGADO"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {detalle.estadoPago}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              setAjusteVisible({ detalle, tipo: "ADELANTO" })
                            }
                            disabled={!puedeHacerAdelanto(detalle)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              puedeHacerAdelanto(detalle)
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              !puedeHacerAdelanto(detalle)
                                ? detalle.estadoPago === "PAGADO"
                                  ? "No se pueden hacer ajustes en registros pagados"
                                  : "No hay monto disponible para adelantos"
                                : ""
                            }
                          >
                            <BanknotesIcon className="w-4 h-4" /> Adelanto
                          </button>
                          <button
                            onClick={() =>
                              setAjusteVisible({ detalle, tipo: "DESCUENTO" })
                            }
                            disabled={!puedeHacerDescuento(detalle)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              puedeHacerDescuento(detalle)
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              !puedeHacerDescuento(detalle)
                                ? detalle.estadoPago === "PAGADO"
                                  ? "No se pueden hacer ajustes en registros pagados"
                                  : "No hay monto disponible para descuentos"
                                : ""
                            }
                          >
                            <MinusCircleIcon className="w-4 h-4" /> Descuento
                          </button>
                          {detalle.estadoPago === "PENDIENTE" && (
                            <button
                              onClick={() => handleMarcarPago(detalle.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                            >
                              <CurrencyDollarIcon className="w-4 h-4" /> Marcar
                              Pagado
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setHistorialVisible(detalle)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs"
                        >
                          <ClockIcon className="w-4 h-4" /> Ver historial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={previousPage}
                disabled={!hasPreviousPage}
                className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-5 h-5" /> Anterior
              </button>
              <span className="text-sm text-slate-600">
                Página {currentPage} de {lastPage || 1}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
              >
                Siguiente <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      {historialVisible && (
        <ModalHistorial
          show={!!historialVisible}
          detalle={historialVisible}
          onClose={() => setHistorialVisible(null)}
        />
      )}
      {ajusteVisible && (
        <ModalAjuste
          show={!!ajusteVisible}
          detalle={ajusteVisible.detalle}
          tipo={ajusteVisible.tipo}
          onClose={() => setAjusteVisible(null)}
          onSave={handleGuardarAjuste}
        />
      )}
    </div>
  );
}
