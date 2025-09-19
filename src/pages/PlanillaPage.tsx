import { useCallback, useEffect, useState } from "react";
import FiltrosPlanilla from "../components/planilla-components/FiltrosPlanilla";
import ModalAjuste, {
  type AjustePayload,
  type TipoAjuste,
} from "../components/planilla-components/ModalAjuste";
import ModalHistorial from "../components/planilla-components/ModalHistorial";
import TablaPlanilla from "../components/planilla-components/TablaPlanilla";
import useFetchApi from "../hooks/use-fetch";
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
  fetchPlanilla: () => Promise<void>
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
  await fetchPlanilla();
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
  trabajador: {
    id: number;
    nombres: string;
    apellidos: string;
    banco: string;
    numeroCuenta: string;
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
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planillas, setPlanillas] = useState<PlanillaAPI[]>([]);
  const [planillaSeleccionada, setPlanillaSeleccionada] =
    useState<PlanillaAPI | null>(null);

  const [historialVisible, setHistorialVisible] =
    useState<DetallePlanillaAPI | null>(null);
  const [ajusteVisible, setAjusteVisible] = useState<{
    detalle: DetallePlanillaAPI;
    tipo: TipoAjuste;
  } | null>(null);

  const fetchPlanilla = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPlanillas([]);
    try {
      const params = new URLSearchParams({
        anio: selectedYear.toString(),
        mes: selectedMonth.toString(),
      });
      if (busqueda.trim()) params.append("buscar", busqueda.trim());

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
        setError(
          err.response?.data?.message || "Error al cargar las planillas."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [get, selectedYear, selectedMonth, busqueda]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlanilla();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPlanilla, busqueda]);

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
        await fetchPlanilla();
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
        await fetchPlanilla();
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
        await fetchPlanilla();
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
        await fetchPlanilla();
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
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          Planillas del Período
        </h3>
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
                              fetchPlanilla
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

      {/* Búsqueda - pegada a la tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            Detalles de Planilla
          </h3>
          <div className="w-64">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={isLoading}
              placeholder="Buscar por nombre, cuenta o banco"
              className="block w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      </div>

      <TablaPlanilla
        detalles={planillaSeleccionada?.detalles || []}
        isLoading={isLoading}
        error={error}
        onOpenHistorial={setHistorialVisible}
        onOpenAjuste={(detalle, tipo) => setAjusteVisible({ detalle, tipo })}
        onMarcarPago={handleMarcarPago}
      />
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
