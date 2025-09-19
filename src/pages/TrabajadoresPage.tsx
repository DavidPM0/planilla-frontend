import {
  ArrowPathIcon,
  ArrowUturnUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import useFetchApi from "../hooks/use-fetch";
import { toast } from "sonner";

type TrabajadorAPI = {
  id: number;
  nombres: string;
  apellidos: string;
  banco: string | null;
  numeroCuenta: string | null;
  estadoRegistro: boolean;
  fechaCreacion: string;
};

type CreateTrabajadorFormData = {
  nombres: string;
  apellidos: string;
  banco: string;
  numeroCuenta: string;
};

export type UpdateTrabajadorFormData = Partial<CreateTrabajadorFormData>;

const StatusToggleButton = ({
  trabajador,
  onStatusChange,
}: {
  trabajador: TrabajadorAPI;
  onStatusChange: (trabajadorId: number, newStatus: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { del, patch } = useFetchApi();

  const handleChangeStatus = async () => {
    const newStatus = !trabajador.estadoRegistro;
    const actionText = newStatus ? "reactivar" : "desactivar";
    if (
      !window.confirm(
        `¿Está seguro de que desea ${actionText} a este trabajador?`
      )
    )
      return;

    setIsLoading(true);
    try {
      if (newStatus) {
        await patch(`/trabajadores/${trabajador.id}`, {
          estadoRegistro: newStatus,
        });
      } else {
        await del(`/trabajadores/${trabajador.id}`);
      }
      onStatusChange(trabajador.id, newStatus);
    } catch (error) {
      alert(`No se pudo ${actionText} al trabajador.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = trabajador.estadoRegistro;
  const buttonStyle = `p-1 rounded-full transition ${
    isLoading ? "cursor-not-allowed opacity-50" : ""
  }`;
  const activeStyle = `text-red-500 hover:text-red-700 hover:bg-red-100 ${buttonStyle}`;
  const inactiveStyle = `text-green-500 hover:text-green-700 hover:bg-green-100 ${buttonStyle}`;
  const iconStyle = "w-5 h-5";

  if (isLoading) {
    return (
      <button className={isActive ? activeStyle : inactiveStyle} disabled>
        <ArrowPathIcon className={`${iconStyle} animate-spin`} />
      </button>
    );
  }

  return (
    <button
      title={isActive ? "Desactivar trabajador" : "Reactivar trabajador"}
      onClick={handleChangeStatus}
      className={isActive ? activeStyle : inactiveStyle}
    >
      {isActive ? (
        <TrashIcon className={iconStyle} />
      ) : (
        <ArrowUturnUpIcon className={iconStyle} />
      )}
    </button>
  );
};

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
    banco: "",
    numeroCuenta: "",
  };

  const [formData, setFormData] =
    useState<CreateTrabajadorFormData>(initialFormState);
  const [trabajadores, setTrabajadores] = useState<TrabajadorAPI[]>([]);
  const [editingTrabajador, setEditingTrabajador] =
    useState<TrabajadorAPI | null>(null);
  const [filtro, setFiltro] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPorPagina = 9;

  const { get, post, patch } = useFetchApi();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await get<TrabajadorAPI[]>("/trabajadores");
      setTrabajadores(data);
    } catch (err) {
      setError("No se pudieron cargar los trabajadores.");
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const createPromise = async () => {
      try {
        await post("/trabajadores", formData);
        await fetchData();
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
      await fetchData();
    };

    toast.promise(updatePromise(), {
      loading: "Actualizando trabajador...",
      success: `Trabajador ${
        updatedData.nombres || editingTrabajador.nombres
      } actualizado exitosamente 🎉`,
      error: "Error al actualizar el trabajador",
    });
  };

  const handleStatusChange = (trabajadorId: number, newStatus: boolean) => {
    setTrabajadores((current) =>
      current.map((t) =>
        t.id === trabajadorId ? { ...t, estadoRegistro: newStatus } : t
      )
    );
  };

  const trabajadoresFiltrados = trabajadores.filter(
    (t) =>
      t.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
      t.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
      (t.banco && t.banco.toLowerCase().includes(filtro.toLowerCase())) ||
      (t.numeroCuenta && t.numeroCuenta.includes(filtro))
  );

  const totalPaginas = Math.ceil(trabajadoresFiltrados.length / itemsPorPagina);
  const currentTrabajadores = trabajadoresFiltrados.slice(
    (currentPage - 1) * itemsPorPagina,
    currentPage * itemsPorPagina
  );

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                placeholder="Nombres"
                required
              />
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                placeholder="Apellidos"
                required
              />
              <input
                type="text"
                name="banco"
                value={formData.banco}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                placeholder="Banco (ej: BCP)"
              />
              <input
                type="text"
                name="numeroCuenta"
                value={formData.numeroCuenta}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                placeholder="Número de Cuenta"
              />
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
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por nombre, banco..."
              className="block w-full md:w-64 pl-3 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold text-slate-700 mb-4">
            Trabajadores Registrados
          </h3>
          {isLoading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-4 py-3">Nombre Completo</th>
                      <th className="px-4 py-3">Datos Bancarios</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTrabajadores.map((trabajador) => (
                      <tr key={trabajador.id}>
                        <td className="px-4 py-2">{`${trabajador.nombres} ${trabajador.apellidos}`}</td>
                        <td className="px-4 py-2">
                          {trabajador.banco
                            ? `${trabajador.banco} - ${trabajador.numeroCuenta}`
                            : "No especificado"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              trabajador.estadoRegistro
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trabajador.estadoRegistro ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/trabajadores/${trabajador.id}/contratos`}
                              title="Gestionar Contratos"
                              className="text-blue-500 p-1 hover:bg-blue-100 rounded-full"
                            >
                              <DocumentTextIcon className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => setEditingTrabajador(trabajador)}
                              title="Editar"
                              className="text-indigo-500 p-1 hover:bg-indigo-100 rounded-full"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <StatusToggleButton
                              trabajador={trabajador}
                              onStatusChange={handleStatusChange}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPaginas))
                  }
                  disabled={currentPage === totalPaginas || totalPaginas === 0}
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
