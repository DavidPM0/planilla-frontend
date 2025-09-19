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

export default function PlanillaPage() {
  const { get, post, patch } = useFetchApi();
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detalles, setDetalles] = useState<DetallePlanillaAPI[]>([]);
  const [planillaProcesada, setPlanillaProcesada] = useState(false);

  const [historialVisible, setHistorialVisible] =
    useState<DetallePlanillaAPI | null>(null);
  const [ajusteVisible, setAjusteVisible] = useState<{
    detalle: DetallePlanillaAPI;
    tipo: TipoAjuste;
  } | null>(null);

  const fetchPlanilla = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDetalles([]);
    try {
      const params = new URLSearchParams({
        anio: selectedYear.toString(),
        mes: selectedMonth.toString(),
      });
      if (busqueda.trim()) params.append("buscar", busqueda.trim());
      const data = await get<DetallePlanillaAPI[]>(
        `/planillas/detalles?${params.toString()}`
      );
      setDetalles(data);
      setPlanillaProcesada(true);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPlanillaProcesada(false);
      } else {
        setError(err.response?.data?.message || "Error al cargar la planilla.");
        setPlanillaProcesada(false);
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

  const handleProcesarPlanilla = async () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
      "es-PE",
      { month: "long" }
    );
    if (
      !window.confirm(
        `¿Desea procesar la planilla para ${monthName} de ${selectedYear}?`
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
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onProcesar={handleProcesarPlanilla}
        planillaProcesada={planillaProcesada}
        isLoading={isLoading}
      />
      <TablaPlanilla
        detalles={detalles}
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
