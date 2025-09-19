import { useCallback, useEffect, useState } from "react";
import FiltrosPlanilla from "../components/planilla-components/FiltrosPlanilla";
import ModalAjuste, {
  type AjustePayload,
  type TipoAjuste,
} from "../components/planilla-components/ModalAjuste";
import ModalHistorial from "../components/planilla-components/ModalHistorial";
import TablaPlanilla from "../components/planilla-components/TablaPlanilla";
import useFetchApi from "../hooks/use-fetch";

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
  const [planillasExisten, setPlanillasExisten] = useState(false);
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

      console.log("Fetching planillas with params:", params.toString());

      const data = await get<PlanillaAPI[]>(
        `/planillas/detalles?${params.toString()}`
      );

      console.log("Received data:", data);

      setPlanillas(data);
      setPlanillasExisten(data.length > 0);

      // Seleccionar la primera planilla por defecto
      if (data.length > 0) {
        setPlanillaSeleccionada(data[0]);
        console.log("Selected first planilla:", data[0]);
      } else {
        setPlanillaSeleccionada(null);
      }
    } catch (err: any) {
      console.error("Error fetching planillas:", err);
      if (err.response?.status === 404) {
        setPlanillasExisten(false);
        setPlanillas([]);
        setPlanillaSeleccionada(null);
      } else {
        setError(
          err.response?.data?.message || "Error al cargar las planillas."
        );
        setPlanillasExisten(false);
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

  // ======================================
  // NUEVAS FUNCIONES PARA GENERACIÓN INDEPENDIENTE
  // ======================================

  const handleProcesarPrimeraQuincena = async () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "es-PE",
      { month: "long" }
    );
    if (
      !window.confirm(
        `¿Desea generar la planilla de PRIMERA QUINCENA para ${monthName} de ${selectedYear}?\n\nEsto procesará únicamente empleados con contratos quincenales para el período del 1 al 15.`
      )
    )
      return;

    setIsLoading(true);
    try {
      const response = (await post("/planillas/procesar-primera-quincena", {
        anio: selectedYear,
        mes: selectedMonth,
      })) as { mensaje: string };
      alert(`✅ ${response.mensaje}`);
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `❌ Error: ${
          err.response?.data?.message ||
          "No se pudo procesar la primera quincena."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcesarSegundaQuincena = async () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "es-PE",
      { month: "long" }
    );
    if (
      !window.confirm(
        `¿Desea generar la planilla de SEGUNDA QUINCENA para ${monthName} de ${selectedYear}?\n\nEsto procesará únicamente empleados con contratos quincenales para el período del 16 al último día del mes.`
      )
    )
      return;

    setIsLoading(true);
    try {
      const response = (await post("/planillas/procesar-segunda-quincena", {
        anio: selectedYear,
        mes: selectedMonth,
      })) as { mensaje: string };
      alert(`✅ ${response.mensaje}`);
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `❌ Error: ${
          err.response?.data?.message ||
          "No se pudo procesar la segunda quincena."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcesarMensual = async () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "es-PE",
      { month: "long" }
    );
    if (
      !window.confirm(
        `¿Desea generar la planilla MENSUAL para ${monthName} de ${selectedYear}?\n\nEsto procesará únicamente empleados con contratos mensuales para todo el mes.`
      )
    )
      return;

    setIsLoading(true);
    try {
      const response = (await post("/planillas/procesar-mensual", {
        anio: selectedYear,
        mes: selectedMonth,
      })) as { mensaje: string };
      alert(`✅ ${response.mensaje}`);
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `❌ Error: ${
          err.response?.data?.message ||
          "No se pudo procesar la planilla mensual."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerarPlanilla = async () => {
    if (!planillaSeleccionada) {
      alert("Debe seleccionar una planilla para regenerar");
      return;
    }

    const motivo = window.prompt(
      "Ingrese el motivo de la regeneración:",
      "Corrección por actualización de datos"
    );

    if (!motivo || motivo.trim() === "") {
      alert("Debe proporcionar un motivo para la regeneración");
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

    setIsLoading(true);
    try {
      const response = (await post(`/planillas/regenerar/${planilla.id}`, {
        motivoReemplazo: motivo,
      })) as { mensaje: string };
      alert(`✅ ${response.mensaje}`);
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `❌ Error: ${
          err.response?.data?.message || "No se pudo regenerar la planilla."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función legacy mantenida por compatibilidad (deprecada)
  const handleProcesarPlanilla = async () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "es-PE",
      { month: "long" }
    );
    if (
      !window.confirm(
        `¿Desea procesar TODAS las planillas para ${monthName} de ${selectedYear}?\n\n⚠️ MÉTODO LEGACY: Se recomienda usar los botones específicos por tipo de planilla.`
      )
    )
      return;

    setIsLoading(true);
    try {
      await post("/planillas/procesar", {
        anio: selectedYear,
        mes: selectedMonth,
      });
      alert("¡Planilla procesada exitosamente!");
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `Error: ${
          err.response?.data?.message || "No se pudo procesar la planilla."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarAjuste = async (payload: Omit<AjustePayload, "tipo">) => {
    if (!ajusteVisible) return;
    const { detalle, tipo } = ajusteVisible;
    try {
      await post(`/planillas/detalles/${detalle.id}/ajustes`, {
        ...payload,
        tipo,
      });
      alert("¡Ajuste guardado exitosamente!");
      setAjusteVisible(null);
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `Error: ${
          err.response?.data?.message || "No se pudo guardar el ajuste."
        }`
      );
    }
  };

  const handleMarcarPago = async (detalleId: number) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea marcar este pago como realizado?"
      )
    )
      return;
    try {
      await patch(`/planillas/detalles/${detalleId}/pagar`, {});
      alert("¡Pago registrado exitosamente!");
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `Error: ${
          err.response?.data?.message ||
          "No se pudo actualizar el estado del pago."
        }`
      );
    }
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

    try {
      await patch(`/planillas/${planillaId}/estado`, { estado: nuevoEstado });
      alert(
        `¡Planilla ${estadoTexto
          .replace("procesar", "procesada")
          .replace("marcar como pagada", "marcada como pagada")} exitosamente!`
      );
      await fetchPlanilla();
    } catch (err: any) {
      alert(
        `Error: ${
          err.response?.data?.message || `Error al ${estadoTexto} la planilla`
        }`
      );
    }
  };

  return (
    <div className="p-6 bg-[#f9fafb] flex flex-col space-y-6 min-h-screen">
      {/* Debug info */}
      <div className="bg-gray-100 p-2 text-xs">
        Debug: planillas={planillas.length}, seleccionada=
        {planillaSeleccionada?.planilla?.id || "none"}
      </div>

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
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onProcesar={handleProcesarPlanilla}
        onProcesarPrimeraQuincena={handleProcesarPrimeraQuincena}
        onProcesarSegundaQuincena={handleProcesarSegundaQuincena}
        onProcesarMensual={handleProcesarMensual}
        onRegenerarPlanilla={handleRegenerarPlanilla}
        planillaProcesada={planillasExisten}
        planillaSeleccionada={planillaSeleccionada}
        isLoading={isLoading}
      />

      {/* Selector de Planillas */}
      {planillasExisten && planillas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Planillas del Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planillas.map((planilla) => (
              <div
                key={planilla.planilla.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  planillaSeleccionada?.planilla.id === planilla.planilla.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setPlanillaSeleccionada(planilla)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-900">
                    {planilla.planilla.descripcion}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      planilla.planilla.estado === "PAGADA"
                        ? "bg-green-100 text-green-800"
                        : planilla.planilla.estado === "PROCESADA"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {planilla.planilla.estado}
                  </span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    📅{" "}
                    {planilla.planilla.fechaInicio
                      ? new Date(
                          planilla.planilla.fechaInicio
                        ).toLocaleDateString("es-PE")
                      : "N/A"}{" "}
                    -{" "}
                    {planilla.planilla.fechaFin
                      ? new Date(planilla.planilla.fechaFin).toLocaleDateString(
                          "es-PE"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    💰 Total: S/{" "}
                    {Number(planilla.planilla.montoTotal || 0).toFixed(2)}
                  </p>
                  <p>👥 Empleados: {planilla.detalles?.length || 0}</p>
                </div>

                {/* Botones de acción */}
                <div className="mt-3 flex gap-2">
                  {planilla.planilla.estado === "GENERADA" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCambiarEstado(planilla.planilla.id, "PROCESADA");
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Procesar
                    </button>
                  )}
                  {planilla.planilla.estado === "PROCESADA" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCambiarEstado(planilla.planilla.id, "PAGADA");
                      }}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Marcar Pagada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
