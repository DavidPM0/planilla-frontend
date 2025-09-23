import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import useFetchApi from "../hooks/use-fetch";
import { usePaginationQuery } from "../hooks/use-pagination-query";
import { toast } from "sonner";
import { formatFechaUTC } from "../utils/date-utils";

import type { User } from "../context/auth-context";
import type { UpdateUserFormData } from "../components/edit-user-modal";
import EditUserModal from "../components/edit-user-modal";
import StatusToggleButton from "../components/usuario-components/StatusToggleButton";

// --- TIPOS DE DATOS ---
type Perfil = {
  id: number;
  nombre: string;
};

type CreateUserFormData = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoElectronico: string;
  clave: string;
  perfilesIds: number[];
};

// --- COMPONENTE PRINCIPAL ---
export default function UsuariosPage() {
  const initialFormState: CreateUserFormData = {
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correoElectronico: "",
    clave: "",
    perfilesIds: [],
  };

  const [formData, setFormData] =
    useState<CreateUserFormData>(initialFormState);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { get, post, patch } = useFetchApi();

  // Usar el hook de paginación mejorado
  const {
    data: users,
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
  } = usePaginationQuery<User>("/auth/usuarios", {
    limit: 10,
    initialSearch: "",
  });

  // Combinar errores
  const combinedError = error || paginationError;

  // Solo necesitamos cargar los perfiles
  useEffect(() => {
    get<Perfil[]>("/auth/perfiles")
      .then(setPerfiles)
      .catch(() => setError("No se pudieron cargar los perfiles."));
  }, [get]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "perfilesIds") {
      setFormData((prev) => ({ ...prev, perfilesIds: [Number(value)] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generarContrasena = () => {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const pass = Array.from({ length: 12 }, () =>
      caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    ).join("");
    setFormData((prev) => ({ ...prev, clave: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.perfilesIds.length === 0) {
      toast.error("Por favor, seleccione un rol");
      return;
    }

    const payload = { ...formData };
    if (!payload.apellidoMaterno) {
      delete (payload as Partial<CreateUserFormData>).apellidoMaterno;
    }

    const createPromise = async () => {
      await post("/auth/register", payload);
      // Refresca los datos después de crear
      refresh();
      setFormData(initialFormState);
    };

    toast.promise(createPromise(), {
      loading: "Creando usuario...",
      success: `Usuario ${formData.nombres} ${formData.apellidoPaterno} creado exitosamente 🎉`,
      error: (err) => {
        const errorMessage =
          err.response?.data?.message || "Error al crear el usuario";
        const message = Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage;
        return `Error: ${message}`;
      },
    });
  };

  const handleEditClick = (user: User) => setEditingUser(user);
  const handleCloseEditModal = () => setEditingUser(null);

  const handleUpdateUser = async (updatedData: UpdateUserFormData) => {
    if (!editingUser) return;

    const payload = { ...updatedData };
    if (!payload.apellidoMaterno) {
      delete (payload as Partial<UpdateUserFormData>).apellidoMaterno;
    }

    const updatePromise = async () => {
      await patch(`/auth/update-user/${editingUser.id}`, payload);
      setEditingUser(null);
      // Refresca los datos después de actualizar
      refresh();
    };

    toast.promise(updatePromise(), {
      loading: "Actualizando usuario...",
      success: `Usuario ${updatedData.nombres || editingUser.nombres} ${
        updatedData.apellidoPaterno || editingUser.apellidoPaterno
      } actualizado exitosamente 🎉`,
      error: "Error al actualizar el usuario",
    });
  };

  const handleUserStatusChange = (_userId: number, _newStatus: boolean) => {
    // El hook se encarga de mantener la sincronización de datos automáticamente
    // Opcional: podrías llamar refresh() aquí si necesitas recargar los datos inmediatamente
    refresh();
  };

  const formatearFecha = (fechaISO: string | null) => {
    if (!fechaISO) return "-";
    return new Date(fechaISO).toLocaleString("es-PE");
  };

  return (
    <div className="bg-[#f9fafb] flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-slate-600 text-sm">
          Administra los usuarios registrados
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 space-y-4 max-w-3xl w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ej: Pérez"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ej: Gómez (Opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  name="clave"
                  value={formData.clave}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-8 text-slate-500 hover:text-indigo-500"
                >
                  {mostrarContrasena ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <p
                  className="text-xs text-slate-500 mt-1 cursor-pointer hover:text-indigo-500"
                  onClick={generarContrasena}
                >
                  Generar contraseña segura
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol
                </label>
                <select
                  name="perfilesIds"
                  value={formData.perfilesIds[0] || ""}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  {perfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar usuario
            </button>
          </form>
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar usuario
            </label>
            <div className="relative text-slate-400 focus-within:text-indigo-500">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, apellido, correo..."
                className="block w-full md:w-64 pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold text-slate-700 mb-4">
            Usuarios registrados
          </h3>
          {isLoading ? (
            <p>Cargando usuarios...</p>
          ) : combinedError ? (
            <p className="text-red-500">{combinedError}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-4 py-3">Nombre Completo</th>
                      <th className="px-4 py-3">Correo</th>
                      <th className="px-4 py-3">Roles</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Fecha creación</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-2">{`${user.nombres} ${user.apellidoPaterno}`}</td>
                        <td className="px-4 py-2">{user.correoElectronico}</td>
                        <td className="px-4 py-2">
                          {user.perfiles.join(", ")}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.estadoRegistro
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.estadoRegistro ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {formatearFecha(user.fechaCreacion)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs"
                              title="Editar usuario"
                            >
                              <PencilIcon className="w-4 h-4" /> Editar
                            </button>
                            <StatusToggleButton
                              user={user}
                              onStatusChange={handleUserStatusChange}
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

      {editingUser && (
        <EditUserModal
          show={!!editingUser}
          user={editingUser}
          perfiles={perfiles}
          onSave={handleUpdateUser}
          onCancel={handleCloseEditModal}
        />
      )}
    </div>
  );
}
