import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import useFetchApi from "../hooks/use-fetch";
import { usePaginationQuery } from "../hooks/use-pagination-query";
import { toast } from "sonner";

type TrabajadorAPI = {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  banco: string | null;
  numeroCuenta: string | null;
  estadoRegistro: boolean;
  fechaCreacion: string;
};

type CreateTrabajadorFormData = {
  nombres: string;
  apellidos: string;
  dni: string;
  banco: string;
  numeroCuenta: string;
};

export type UpdateTrabajadorFormData = Partial<CreateTrabajadorFormData>;

interface EditModalProps {
  show: boolean;
  trabajador: TrabajadorAPI;
  onSave: (data: UpdateTrabajadorFormData) => Promise<void>;
  onCancel: () => void;
}

function EditTrabajadorModal({
  show,
  trabajador,
  onSave,
  onCancel,
}: EditModalProps) {
  const [formData, setFormData] = useState({
    nombres: trabajador.nombres,
    apellidos: trabajador.apellidos,
    dni: trabajador.dni,
    banco: trabajador.banco || "",
    numeroCuenta: trabajador.numeroCuenta || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!show) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Editar Trabajador</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            placeholder="Nombres"
            className="w-full border border-slate-300 rounded-md p-2 text-sm"
            required
          />
          <input
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            placeholder="Apellidos"
            className="w-full border border-slate-300 rounded-md p-2 text-sm"
            required
          />
          <input
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            placeholder="DNI"
            className="w-full border border-slate-300 rounded-md p-2 text-sm"
            required
          />
          <input
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            placeholder="Banco"
            className="w-full border border-slate-300 rounded-md p-2 text-sm"
          />
          <input
            name="numeroCuenta"
            value={formData.numeroCuenta}
            onChange={handleChange}
            placeholder="Número de Cuenta"
            className="w-full border border-slate-300 rounded-md p-2 text-sm"
          />
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
              disabled={isSaving}
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

export default function TrabajadoresPage() {
  const initialFormState: CreateTrabajadorFormData = {
    nombres: "",
    apellidos: "",
    dni: "",
    banco: "",
    numeroCuenta: "",
  };

  const [formData, setFormData] =
    useState<CreateTrabajadorFormData>(initialFormState);
  const [editingTrabajador, setEditingTrabajador] =
    useState<TrabajadorAPI | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { post, patch } = useFetchApi();

  // Usar nuestro hook de paginación robusto 🚀
  const {
    data: trabajadores,
    isLoading,
    error: paginationError,
    search,
    setSearch,
    currentPage,
    lastPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    refresh,
  } = usePaginationQuery<TrabajadorAPI>("/trabajadores", {
    limit: 9,
    initialSearch: "",
  });

  // Usar el error de paginación
  const combinedError = paginationError;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const createPromise = async () => {
      try {
        await post("/trabajadores", formData);
        refresh(); // ¡Usamos el refresh del hook!
        setFormData(initialFormState);
      } finally {
        setIsSubmitting(false);
      }
    };

    toast.promise(createPromise(), {
      loading: "Creando trabajador...",
      success: `Trabajador ${formData.nombres} creado exitosamente 🎉`,
      error: (err) => {
        const errorMessage =
          err.response?.data?.message || "Error al crear el trabajador";
        const message = Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage;
        return `Error: ${message}`;
      },
    });
  };

  const handleUpdateTrabajador = async (
    updatedData: UpdateTrabajadorFormData
  ) => {
    if (!editingTrabajador) return;

    const updatePromise = async () => {
      await patch(`/trabajadores/${editingTrabajador.id}`, updatedData);
      setEditingTrabajador(null);
      refresh(); // ¡Usamos el refresh del hook!
    };

    toast.promise(updatePromise(), {
      loading: "Actualizando trabajador...",
      success: `Trabajador ${
        updatedData.nombres || editingTrabajador.nombres
      } actualizado exitosamente 🎉`,
      error: "Error al actualizar el trabajador",
    });
  };

  return (
    <div className="bg-[#f9fafb] flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">Trabajadores</h1>
        <p className="text-slate-600 text-sm">
          Gestiona el personal registrado en la empresa.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 space-y-4 max-w-3xl w-full"
          >
            <h3 className="text-md font-semibold text-slate-700 mb-4">
              Agregar Nuevo Trabajador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  placeholder="Nombres"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  placeholder="Apellidos"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  placeholder="DNI"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Banco
                </label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  placeholder="Banco (ej: BCP)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  name="numeroCuenta"
                  value={formData.numeroCuenta}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  placeholder="Número de Cuenta"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-50"
            >
              <PlusIcon className="w-5 h-5" />
              {isSubmitting ? "Agregando..." : "Agregar Trabajador"}
            </button>
          </form>
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar trabajador
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, apellidos, DNI o número de cuenta..."
                className="block w-full md:w-64 pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold text-slate-700 mb-4">
            Trabajadores Registrados
          </h3>
          {isLoading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : combinedError ? (
            <p className="text-red-500 text-center py-4">{combinedError}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-4 py-3">Nombre Completo</th>
                      <th className="px-4 py-3">DNI</th>
                      <th className="px-4 py-3">Datos Bancarios</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trabajadores.map((trabajador) => (
                      <tr key={trabajador.id}>
                        <td className="px-4 py-2">{`${trabajador.nombres} ${trabajador.apellidos}`}</td>
                        <td className="px-4 py-2">{trabajador.dni}</td>
                        <td className="px-4 py-2">
                          {trabajador.banco
                            ? `${trabajador.banco} - ${trabajador.numeroCuenta}`
                            : "No especificado"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/trabajadores/${trabajador.id}/contratos`}
                              title="Gestionar Contratos"
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                            >
                              <DocumentTextIcon className="w-4 h-4" /> Contratos
                            </Link>
                            <button
                              onClick={() => setEditingTrabajador(trabajador)}
                              title="Editar"
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs"
                            >
                              <PencilIcon className="w-4 h-4" /> Editar
                            </button>
                          </div>
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
            </>
          )}
        </div>
      </div>

      {editingTrabajador && (
        <EditTrabajadorModal
          show={!!editingTrabajador}
          trabajador={editingTrabajador}
          onSave={handleUpdateTrabajador}
          onCancel={() => setEditingTrabajador(null)}
        />
      )}
    </div>
  );
}
