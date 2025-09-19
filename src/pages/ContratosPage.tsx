// ============================================================================
// TIPOS DE DATOS

import { PencilIcon, PlusIcon } from "@heroicons/react/16/solid";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useParams } from "react-router-dom";
import useFetchApi from "../hooks/use-fetch";
import { toast } from "sonner";

// ============================================================================
// UTILIDADES
function formatDateForAPI(dateString: string): string {
  if (!dateString) return "";
  // Crear una fecha en la zona horaria local a las 12:00 del mediodía
  // para evitar problemas de timezone
  const date = new Date(dateString + "T12:00:00");
  return date.toISOString();
}

// Función para validar fechas
const validateDates = (
  fechaInicio: string,
  fechaFin: string
): string | null => {
  if (!fechaInicio) return null;
  if (!fechaFin) return null; // Fecha fin es opcional

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (inicio > fin) {
    return "La fecha de inicio no puede ser posterior a la fecha de fin";
  }
  return null;
};

// Función para validar el monto
const validateMonto = (monto: string | number): string | null => {
  const numero = Number(monto);
  if (isNaN(numero)) return "El monto debe ser un número válido";
  if (numero < 0) return "El monto no puede ser negativo";
  if (numero > 999999.99) return "El monto no puede exceder S/ 999,999.99";
  return null;
};

// ============================================================================
type TrabajadorAPI = { id: number; nombres: string; apellidos: string };

const TipoPago = {
  MENSUAL: "MENSUAL",
  QUINCENAL: "QUINCENAL",
} as const;

type TipoPago = (typeof TipoPago)[keyof typeof TipoPago];

type ContratoAPI = {
  id: number;
  fechaInicio: string;
  fechaFin: string | null;
  sueldoBase: number;
  tipoPago: TipoPago;
  tipoContrato: string;
  estaActivo: boolean;
};

type CreateContratoFormData = Omit<ContratoAPI, "id" | "estaActivo"> & {
  trabajadorId: number;
};
export type UpdateContratoFormData = Partial<
  Omit<CreateContratoFormData, "trabajadorId">
>;

// ============================================================================
// COMPONENTE: EditContratoModal
// ============================================================================
interface EditModalProps {
  show: boolean;
  contrato: ContratoAPI;
  onSave: (data: UpdateContratoFormData) => Promise<void>;
  onCancel: () => void;
}

function EditContratoModal({
  show,
  contrato,
  onSave,
  onCancel,
}: EditModalProps) {
  const [formData, setFormData] = useState({
    fechaInicio: contrato.fechaInicio.split("T")[0],
    fechaFin: contrato.fechaFin ? contrato.fechaFin.split("T")[0] : "",
    sueldoBase: contrato.sueldoBase,
    tipoPago: contrato.tipoPago,
    tipoContrato: contrato.tipoContrato,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    fechas?: string;
    monto?: string;
  }>({});

  if (!show) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validaciones en tiempo real
    const newErrors = { ...validationErrors };

    if (name === "fechaInicio" || name === "fechaFin") {
      const fechaInicio = name === "fechaInicio" ? value : formData.fechaInicio;
      const fechaFin = name === "fechaFin" ? value : formData.fechaFin;
      const fechaError = validateDates(fechaInicio, fechaFin);
      if (fechaError) {
        newErrors.fechas = fechaError;
      } else {
        delete newErrors.fechas;
      }
    }

    if (name === "sueldoBase") {
      const montoError = validateMonto(value);
      if (montoError) {
        newErrors.monto = montoError;
      } else {
        delete newErrors.monto;
      }
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validaciones antes de enviar
    const fechaError = validateDates(formData.fechaInicio, formData.fechaFin);
    const montoError = validateMonto(formData.sueldoBase);

    if (fechaError || montoError) {
      setValidationErrors({
        fechas: fechaError || undefined,
        monto: montoError || undefined,
      });
      return;
    }

    setIsSaving(true);
    await onSave({
      ...formData,
      sueldoBase: Number(formData.sueldoBase),
    });
    setIsSaving(false);
    setValidationErrors({}); // Limpiar errores después de guardar exitosamente
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Editar Contrato</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 text-sm ${
                validationErrors.fechas ? "border-red-500" : "border-slate-300"
              }`}
              required
            />
            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 text-sm ${
                validationErrors.fechas ? "border-red-500" : "border-slate-300"
              }`}
            />
            <input
              type="number"
              step="0.01"
              name="sueldoBase"
              value={formData.sueldoBase}
              onChange={handleChange}
              placeholder="Sueldo Base"
              className={`w-full border rounded-md p-2 text-sm ${
                validationErrors.monto ? "border-red-500" : "border-slate-300"
              }`}
              required
            />
            <select
              name="tipoPago"
              value={formData.tipoPago}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md p-2 text-sm"
            >
              <option value={TipoPago.MENSUAL}>Mensual</option>
              <option value={TipoPago.QUINCENAL}>Quincenal</option>
            </select>
            <input
              type="text"
              name="tipoContrato"
              value={formData.tipoContrato}
              onChange={handleChange}
              placeholder="Tipo de Contrato"
              className="w-full border border-slate-300 rounded-md p-2 text-sm"
            />
          </div>

          {/* Mensajes de error en el modal */}
          {(validationErrors.fechas || validationErrors.monto) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              {validationErrors.fechas && (
                <p className="text-red-600 text-sm mb-1">
                  ⚠️ {validationErrors.fechas}
                </p>
              )}
              {validationErrors.monto && (
                <p className="text-red-600 text-sm">
                  ⚠️ {validationErrors.monto}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: ContratosPage
// ============================================================================
export default function ContratosPage() {
  const { trabajadorId } = useParams<{ trabajadorId: string }>();

  const initialFormState = {
    fechaInicio: "",
    fechaFin: "",
    sueldoBase: "",
    tipoPago: TipoPago.MENSUAL,
    tipoContrato: "Plazo Fijo",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [trabajador, setTrabajador] = useState<TrabajadorAPI | null>(null);
  const [contratos, setContratos] = useState<ContratoAPI[]>([]);
  const [editingContrato, setEditingContrato] = useState<ContratoAPI | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    fechas?: string;
    monto?: string;
  }>({});

  const { get, post, patch } = useFetchApi();

  const fetchData = useCallback(async () => {
    if (!trabajadorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [trabajadorData, contratosData] = await Promise.all([
        get<TrabajadorAPI>(`/trabajadores/${trabajadorId}`),
        get<ContratoAPI[]>(`/contratos/por-trabajador/${trabajadorId}`),
      ]);
      setTrabajador(trabajadorData);
      setContratos(contratosData);
    } catch (err) {
      setError(
        "No se pudieron cargar los datos del trabajador o sus contratos."
      );
    } finally {
      setIsLoading(false);
    }
  }, [get, trabajadorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validaciones en tiempo real
    const newErrors = { ...validationErrors };

    if (name === "fechaInicio" || name === "fechaFin") {
      const fechaInicio = name === "fechaInicio" ? value : formData.fechaInicio;
      const fechaFin = name === "fechaFin" ? value : formData.fechaFin;
      const fechaError = validateDates(fechaInicio, fechaFin);
      if (fechaError) {
        newErrors.fechas = fechaError;
      } else {
        delete newErrors.fechas;
      }
    }

    if (name === "sueldoBase") {
      const montoError = validateMonto(value);
      if (montoError) {
        newErrors.monto = montoError;
      } else {
        delete newErrors.monto;
      }
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trabajadorId) return;

    // Validaciones antes de enviar
    const fechaError = validateDates(formData.fechaInicio, formData.fechaFin);
    const montoError = validateMonto(formData.sueldoBase);

    if (fechaError || montoError) {
      setValidationErrors({
        fechas: fechaError || undefined,
        monto: montoError || undefined,
      });
      return;
    }

    const createPromise = async () => {
      const payload = {
        ...formData,
        trabajadorId: Number(trabajadorId),
        sueldoBase: Number(formData.sueldoBase),
        fechaInicio: formatDateForAPI(formData.fechaInicio),
        fechaFin: formData.fechaFin
          ? formatDateForAPI(formData.fechaFin)
          : null,
      };

      await post("/contratos", payload);
      await fetchData();
      setFormData(initialFormState);
      setValidationErrors({});
    };

    toast.promise(createPromise(), {
      loading: "Creando contrato...",
      success: "¡Contrato creado exitosamente!",
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "Error al crear el contrato.";
        const message = Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage;
        console.error("Error creating contrato:", err);
        return `Error: ${message}`;
      },
    });
  };

  const handleUpdateContrato = async (updatedData: UpdateContratoFormData) => {
    if (!editingContrato) return;

    const updatePromise = async () => {
      const payload = {
        ...updatedData,
        sueldoBase: Number(updatedData.sueldoBase),
        fechaInicio: updatedData.fechaInicio
          ? formatDateForAPI(updatedData.fechaInicio)
          : undefined,
        fechaFin: updatedData.fechaFin
          ? formatDateForAPI(updatedData.fechaFin)
          : null,
      };
      await patch(`/contratos/${editingContrato.id}`, payload);
      setEditingContrato(null);
      await fetchData();
    };

    toast.promise(updatePromise(), {
      loading: "Actualizando contrato...",
      success: "Contrato actualizado exitosamente",
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "Error al actualizar el contrato.";
        console.error("Error updating contrato:", err);
        return errorMessage;
      },
    });
  };

  if (isLoading)
    return <div className="p-6">Cargando datos del contrato...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-[#f9fafb] flex flex-col min-h-screen">
      <div className="p-6">
        <Link
          to="/trabajadores"
          className="text-sm text-indigo-600 hover:underline mb-2 block"
        >
          &larr; Volver a Trabajadores
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          Contratos de:{" "}
          <span className="text-indigo-600">
            {trabajador?.nombres} {trabajador?.apellidos}
          </span>
        </h1>
        <p className="text-slate-600 text-sm">
          Gestiona el historial de contratos y registra nuevos acuerdos.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {/* Formulario de creación */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-4 space-y-4"
        >
          <h3 className="text-md font-semibold text-slate-700">
            Registrar Nuevo Contrato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="fechaInicio"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Fecha Inicio
              </label>
              <input
                id="fechaInicio"
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-2 text-sm ${
                  validationErrors.fechas
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
                required
              />
            </div>
            <div>
              <label
                htmlFor="fechaFin"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Fecha Fin (Opcional)
              </label>
              <input
                id="fechaFin"
                type="date"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-2 text-sm ${
                  validationErrors.fechas
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="sueldoBase"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Sueldo Base (S/)
              </label>
              <input
                id="sueldoBase"
                type="number"
                step="0.01"
                name="sueldoBase"
                value={formData.sueldoBase}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-2 text-sm ${
                  validationErrors.monto ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Ej: 1500.00"
                required
              />
            </div>
            <div>
              <label
                htmlFor="tipoPago"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Tipo de Pago
              </label>
              <select
                id="tipoPago"
                name="tipoPago"
                value={formData.tipoPago}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
              >
                <option value={TipoPago.MENSUAL}>Mensual</option>
                <option value={TipoPago.QUINCENAL}>Quincenal</option>
              </select>
            </div>
          </div>

          {/* Mensajes de error */}
          {(validationErrors.fechas || validationErrors.monto) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              {validationErrors.fechas && (
                <p className="text-red-600 text-sm mb-1">
                  ⚠️ {validationErrors.fechas}
                </p>
              )}
              {validationErrors.monto && (
                <p className="text-red-600 text-sm">
                  ⚠️ {validationErrors.monto}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={Object.keys(validationErrors).length > 0}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            Guardar Contrato
          </button>
        </form>

        {/* Tabla de contratos */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold text-slate-700 mb-4">
            Historial de Contratos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-slate-600">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-4 py-3">Fecha Inicio</th>
                  <th className="px-4 py-3">Fecha Fin</th>
                  <th className="px-4 py-3">Sueldo Base</th>
                  <th className="px-4 py-3">Tipo de Pago</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => (
                  <tr key={contrato.id}>
                    <td className="px-4 py-2">
                      {new Date(contrato.fechaInicio).toLocaleDateString(
                        "es-PE"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {contrato.fechaFin
                        ? new Date(contrato.fechaFin).toLocaleDateString(
                            "es-PE"
                          )
                        : "Indefinido"}
                    </td>
                    <td className="px-4 py-2">
                      S/ {Number(contrato.sueldoBase).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{contrato.tipoPago}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contrato.estaActivo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contrato.estaActivo ? "Vigente" : "Finalizado"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setEditingContrato(contrato)}
                        title="Editar Contrato"
                        className="text-indigo-500 p-1 hover:bg-indigo-100 rounded-full"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingContrato && (
        <EditContratoModal
          show={!!editingContrato}
          contrato={editingContrato}
          onSave={handleUpdateContrato}
          onCancel={() => setEditingContrato(null)}
        />
      )}
    </div>
  );
}
