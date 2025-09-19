import { useEffect, useState, useCallback } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import useFetchApi from "../hooks/use-fetch";
import { toast } from "sonner";

// --- TIPOS DE DATOS ---
type Categoria = {
  id: number;
  nombre: string;
  descripcion: string;
  tipoCategoria: "INGRESO";
  cantidadTransacciones: number; // La API lo devuelve, lo mantenemos por consistencia
  fechaCreacion: string;
  fechaModificacion: string;
};

type CreateCategoriaRequest = {
  nombre: string;
  descripcion: string;
  tipo: "INGRESO";
};

interface EditModalProps {
  categoria: Categoria;
  onSave: (categoria: Categoria) => void;
  onCancel: () => void;
}

// --- COMPONENTE MODAL PARA LA EDICIÓN ---
const EditModal = ({ categoria, onSave, onCancel }: EditModalProps) => {
  const [nombre, setNombre] = useState(categoria.nombre);
  const [descripcion, setDescripcion] = useState(categoria.descripcion);

  const handleSave = () => {
    if (!nombre.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }
    onSave({
      ...categoria,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          Editar Categoría de Ingreso
        </h2>
        <div>
          <label
            htmlFor="edit-nombre"
            className="block text-sm font-medium text-slate-700"
          >
            Nombre
          </label>
          <input
            id="edit-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="edit-descripcion"
            className="block text-sm font-medium text-slate-700"
          >
            Descripción
          </label>
          <textarea
            id="edit-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function CategoriasIngresosPage() {
  // Estados para el formulario de creación
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados de la página
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriasPorPagina = 9;

  // Estados para el Modal de edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );

  const { get, post, patch, del } = useFetchApi();

  const fetchCategorias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await get<Categoria[]>("/categorias?tipo=INGRESO");
      setCategorias(data);
    } catch (err) {
      setError("Error al cargar las categorías de ingresos.");
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() === "") {
      toast.error("El nombre de la categoría es requerido");
      return;
    }

    const nuevaCategoriaRequest: CreateCategoriaRequest = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      tipo: "INGRESO",
    };

    const createPromise = post("/categorias", nuevaCategoriaRequest).then(
      async () => {
        await fetchCategorias();
        setNombre("");
        setDescripcion("");
      }
    );

    toast.promise(createPromise, {
      loading: "Creando categoría...",
      success: `Categoría "${nombre.trim()}" creada exitosamente`,
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "No se pudo crear la categoría.";
        console.error("Error creating categoria:", err);
        return errorMessage;
      },
    });
  };

  const handleDelete = async (id: number) => {
    const categoriaToDelete = categorias.find((cat) => cat.id === id);
    const categoriaName = categoriaToDelete?.nombre || "la categoría";

    if (
      window.confirm(`¿Está seguro de que desea eliminar "${categoriaName}"?`)
    ) {
      const deletePromise = del(`/categorias/${id}`)
        .then(() => {
          setCategorias(categorias.filter((cat) => cat.id !== id));
        })
        .catch(async (err) => {
          await fetchCategorias(); // Refrescar en caso de error
          throw err;
        });

      toast.promise(deletePromise, {
        loading: "Eliminando categoría...",
        success: `Categoría "${categoriaName}" eliminada exitosamente`,
        error: (err) => {
          const errorMessage =
            err?.response?.data?.message || "No se pudo eliminar la categoría.";
          console.error("Error deleting categoria:", err);
          return errorMessage;
        },
      });
    }
  };

  const handleEditClick = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategoria(null);
  };

  const handleUpdate = async (categoriaActualizada: Categoria) => {
    const { id, nombre, descripcion } = categoriaActualizada;
    const dataToUpdate = { nombre, descripcion };

    const updatePromise = patch(`/categorias/${id}`, dataToUpdate).then(
      async () => {
        handleCloseModal();
        await fetchCategorias();
      }
    );

    toast.promise(updatePromise, {
      loading: "Actualizando categoría...",
      success: `Categoría "${nombre}" actualizada exitosamente`,
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "No se pudo actualizar la categoría.";
        console.error("Error updating categoria:", err);
        return errorMessage;
      },
    });
  };

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(filtro.toLowerCase())
  );
  const totalPaginas = Math.ceil(
    categoriasFiltradas.length / categoriasPorPagina
  );
  const startIndex = (currentPage - 1) * categoriasPorPagina;
  const currentCategorias = categoriasFiltradas.slice(
    startIndex,
    startIndex + categoriasPorPagina
  );
  const formatearFecha = (fechaISO: string) =>
    new Date(fechaISO).toLocaleString();

  return (
    <div className="bg-[#f9fafb] flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Categorías de Ingresos
        </h1>
        <p className="text-slate-600 text-sm">
          Administra las categorías para tus ingresos
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          {/* --- FORMULARIO VISIBLE --- */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 space-y-4 max-w-md w-full"
          >
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-slate-700"
              >
                Nombre de la categoría
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Sueldo, Bonificaciones..."
              />
            </div>
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-slate-700"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Breve descripción de la categoría..."
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar categoría
            </button>
          </form>

          {/* --- BUSCADOR --- */}
          <div className="w-full md:w-64 relative">
            <label
              htmlFor="buscar"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Buscar categoría
            </label>
            <div className="relative text-slate-400 focus-within:text-indigo-500">
              <input
                id="buscar"
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar categoría..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm"
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

        {/* Tabla de categorías */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold text-slate-700 mb-4">
            Categorías registradas
          </h3>
          {isLoading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Descripción</th>
                      <th className="px-4 py-3 text-center">
                        Cant. Transacciones
                      </th>
                      <th className="px-4 py-3">Fecha Creación</th>
                      <th className="px-4 py-3">Última Modificación</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategorias.map((cat) => (
                      <tr key={cat.id}>
                        <td className="px-4 py-2">{cat.id}</td>
                        <td className="px-4 py-2">{cat.nombre}</td>
                        <td className="px-4 py-2">{cat.descripcion}</td>
                        <td className="px-4 py-2 text-center">
                          {cat.cantidadTransacciones}
                        </td>
                        <td className="px-4 py-2">
                          {formatearFecha(cat.fechaCreacion)}
                        </td>
                        <td className="px-4 py-2">
                          {formatearFecha(cat.fechaModificacion)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(cat)}
                              title="Editar"
                              className="text-indigo-500 hover:text-indigo-700 p-1"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              title="Eliminar"
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <TrashIcon className="w-5 h-5" />
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
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-sm text-slate-600"
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
                  className="flex items-center gap-1 text-sm text-slate-600"
                >
                  Siguiente <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODAL PARA EDITAR CATEGORÍA --- */}
      {isModalOpen && editingCategoria && (
        <EditModal
          categoria={editingCategoria}
          onSave={handleUpdate}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
}
