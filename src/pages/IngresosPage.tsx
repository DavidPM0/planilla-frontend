import { useEffect, useState, useMemo } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import useFetchApi from "../hooks/use-fetch";
import { usePaginationQuery } from "../hooks/use-pagination-query";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

// --- TIPOS DE DATOS ---
type Categoria = {
  id: number;
  nombre: string;
};

type Empresa = {
  id: number;
  nombre: string;
};

// 1. Tipo para las transacciones que RECIBIMOS de la API
type Transaccion = {
  id: number;
  nombre: string;
  tipo: "INGRESO"; // Cambio clave
  monto: string;
  fechaCreacion: string;
  fechaModificacion: string;
  empresa: Empresa | null;
  categoria: Categoria | null;
};

// 2. Tipo para la data que ENVIAMOS al CREAR una transacción (POST)
type CreateTransaccionRequest = {
  nombre: string;
  monto: number;
  categoriaId: number;
  tipo: "INGRESO"; // Cambio clave
};

// 3. Tipo para la data que ENVIAMOS al ACTUALIZAR una transacción (PATCH)
type UpdateTransaccionRequest = {
  nombre: string;
  monto: number;
  categoriaId: number;
};

// Meses y Años
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
// Lógica simple: desde 2025 hacia adelante, preservando siempre el año base
const currentYear = new Date().getFullYear();
const BASE_YEAR = 2025; // Año base que NUNCA desaparece
const endYear = Math.max(currentYear + 2, 2035); // Al menos hasta 2035
const YEARS = Array.from(
  { length: endYear - BASE_YEAR + 1 },
  (_, i) => BASE_YEAR + i
);

// --- MODALES ---

interface IngresoModalProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  categorias: Categoria[];
  ingreso?: Transaccion | null; // Opcional, solo para editar
}

const IngresoModal = ({
  onSave,
  onCancel,
  categorias,
  ingreso = null,
}: IngresoModalProps) => {
  const [nombre, setNombre] = useState(ingreso?.nombre || "");
  const [monto, setMonto] = useState(ingreso ? parseFloat(ingreso.monto) : "");
  const [categoriaId, setCategoriaId] = useState(
    ingreso?.categoria?.id?.toString() || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !monto || !categoriaId) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }
    if (Number(monto) <= 0) {
      toast.error("El monto debe ser mayor a 0.");
      return;
    }
    onSave({ nombre, monto: Number(monto), categoriaId: Number(categoriaId) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          {ingreso ? "Editar" : "Agregar"} Ingreso
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-slate-700"
            >
              Nombre del Ingreso
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-md p-2 mt-1"
              required
            />
          </div>
          <div>
            <label
              htmlFor="monto"
              className="block text-sm font-medium text-slate-700"
            >
              Monto
            </label>
            <input
              id="monto"
              type="number"
              step="0.01"
              min="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full border rounded-md p-2 mt-1"
              required
            />
          </div>
          <div>
            <label
              htmlFor="categoria"
              className="block text-sm font-medium text-slate-700"
            >
              Categoría
            </label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full border rounded-md p-2 mt-1"
              required
            >
              <option value="" disabled>
                Seleccione una categoría
              </option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function IngresosPage() {
  const today = new Date();
  // Usar 2025 como año por defecto si estamos antes, o el año actual si es 2025 o posterior
  const defaultYear = currentYear >= 2025 ? currentYear : 2025;
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState<Transaccion | null>(
    null
  );

  // Estado para el dialog de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    ingresoId: number | null;
    ingresoName: string;
  }>({
    show: false,
    ingresoId: null,
    ingresoName: "",
  });

  const { get, post, patch, del } = useFetchApi();

  // Memoizar additionalParams para evitar re-renderizados infinitos
  const additionalParams = useMemo(
    () => ({
      tipo: "INGRESO",
      anio: selectedYear,
      mes: selectedMonth,
    }),
    [selectedYear, selectedMonth]
  );

  // ¡Usar nuestro hook de paginación robusto! 🚀
  const {
    data: ingresos,
    isLoading,
    error,
    search,
    setSearch,
    currentPage,
    lastPage,
    nextPage,
    previousPage,
    refresh,
  } = usePaginationQuery<Transaccion>("/transacciones", {
    limit: 5,
    initialSearch: "",
    additionalParams,
  });

  // Cargar categorías una sola vez
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const categoriasData = await get<Categoria[]>(
          "/categorias?tipo=INGRESO"
        );
        setCategorias(categoriasData);
      } catch (err) {
        toast.error("No se pudieron cargar las categorías");
      }
    };
    loadCategorias();
  }, [get]);

  const handleAgregar = async (
    ingresoData: Omit<CreateTransaccionRequest, "tipo">
  ) => {
    const createPromise = post("/transacciones", {
      ...ingresoData,
      tipo: "INGRESO",
    }).then(async () => {
      setShowAddModal(false);
      refresh();
    });

    toast.promise(createPromise, {
      loading: "Creando ingreso...",
      success: `Ingreso "${ingresoData.nombre}" creado exitosamente`,
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "Error al crear el ingreso";
        return errorMessage;
      },
    });
  };

  const handleGuardarEdicion = async (
    ingresoData: UpdateTransaccionRequest
  ) => {
    if (!editingIngreso) return;

    const updatePromise = patch(
      `/transacciones/${editingIngreso.id}`,
      ingresoData
    ).then(async () => {
      setEditingIngreso(null);
      refresh();
    });

    toast.promise(updatePromise, {
      loading: "Actualizando ingreso...",
      success: `Ingreso "${ingresoData.nombre}" actualizado exitosamente`,
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "Error al actualizar el ingreso";
        return errorMessage;
      },
    });
  };

  const handleEliminar = (id: number) => {
    const ingresoToDelete = ingresos.find((t: Transaccion) => t.id === id);
    const ingresoName = ingresoToDelete?.nombre || "el ingreso";

    setDeleteDialog({
      show: true,
      ingresoId: id,
      ingresoName,
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.ingresoId) return;

    const deletePromise = del(`/transacciones/${deleteDialog.ingresoId}`).then(
      async () => {
        refresh();
      }
    );

    toast.promise(deletePromise, {
      loading: "Eliminando ingreso...",
      success: `Ingreso "${deleteDialog.ingresoName}" eliminado exitosamente`,
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message || "Error al eliminar el ingreso";
        return errorMessage;
      },
    });

    // Cerrar el dialog
    setDeleteDialog({ show: false, ingresoId: null, ingresoName: "" });
  };

  const cancelDelete = () => {
    setDeleteDialog({ show: false, ingresoId: null, ingresoName: "" });
  };

  const formatearFecha = (fechaISO: string) =>
    new Date(fechaISO).toLocaleDateString("es-PE");

  return (
    <div className="p-6 bg-[#f9fafb] flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ingresos</h1>
        <p className="text-slate-600 text-sm mb-4">
          Gestiona ingresos registrados en el sistema.
        </p>
        <div className="space-y-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                  year === selectedYear
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(index + 1)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition text-center ${
                  index + 1 === selectedMonth
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
          >
            <PlusIcon className="w-5 h-5" /> Agregar ingreso
          </button>
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o categoría"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Lista de ingresos
        </h2>
        {isLoading ? (
          <p>Cargando ingresos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : ingresos.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay ingresos para el período seleccionado.
          </p>
        ) : (
          <>
            <table className="min-w-full text-sm text-left text-slate-600">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Fecha registro</th>
                  <th className="px-4 py-3">Última edición</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((i: Transaccion) => (
                  <tr
                    key={i.id}
                    className={
                      ingresos.indexOf(i) % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50 hover:bg-slate-100"
                    }
                  >
                    <td className="px-4 py-2">{i.nombre}</td>
                    <td className="px-4 py-2">
                      {i.categoria?.nombre || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      S/ {parseFloat(i.monto).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      {formatearFecha(i.fechaCreacion)}
                    </td>
                    <td className="px-4 py-2">
                      {formatearFecha(i.fechaModificacion)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditingIngreso(i)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs"
                        >
                          <PencilIcon className="w-4 h-4" /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(i.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-xs"
                        >
                          <TrashIcon className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={previousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-5 h-5" /> Anterior
              </button>
              <span className="text-sm text-slate-600">
                Página {currentPage} de {lastPage || 1}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === lastPage || lastPage === 0}
                className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
              >
                Siguiente <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <IngresoModal
          onSave={handleAgregar}
          onCancel={() => setShowAddModal(false)}
          categorias={categorias}
        />
      )}
      {editingIngreso && (
        <IngresoModal
          ingreso={editingIngreso}
          onSave={handleGuardarEdicion}
          onCancel={() => setEditingIngreso(null)}
          categorias={categorias}
        />
      )}

      <ConfirmDialog
        show={deleteDialog.show}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar "${deleteDialog.ingresoName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDestructive={true}
      />
    </div>
  );
}
