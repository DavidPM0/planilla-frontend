import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Meses en español
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Años disponibles
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2021 }, (_, i) => 2022 + i);

type Gasto = {
  id: number;
  nombre: string;
  categoria: string;
  monto: number;
  fechaRegistro: string;
  fechaEdicion?: string;
};

export default function GastosPage() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [gastos, setGastos] = useState<Gasto[]>([
    {
      id: 1,
      nombre: "Compra de insumos",
      categoria: "Operativos",
      monto: 500,
      fechaRegistro: "02/09/2025",
      fechaEdicion: "04/09/2025",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const gastosPorPagina = 5;
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editGasto, setEditGasto] = useState<Gasto | null>(null);

  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: "",
    categoria: "",
    monto: "",
  });

  // Filtrar gastos
  const gastosFiltrados = gastos.filter(
    (g) =>
      g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(gastosFiltrados.length / gastosPorPagina);
  const startIndex = (currentPage - 1) * gastosPorPagina;
  const gastosPag = gastosFiltrados.slice(
    startIndex,
    startIndex + gastosPorPagina
  );

  // Funciones
  const handleEliminar = (id: number) => {
    if (confirm("¿Eliminar este gasto?")) {
      setGastos(gastos.filter((g) => g.id !== id));
    }
  };

  const handleAgregar = () => {
    if (
      !nuevoGasto.nombre.trim() ||
      !nuevoGasto.categoria.trim() ||
      !nuevoGasto.monto.trim()
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    const nuevo: Gasto = {
      id: gastos.length ? gastos[gastos.length - 1].id + 1 : 1,
      nombre: nuevoGasto.nombre.trim(),
      categoria: nuevoGasto.categoria.trim(),
      monto: parseFloat(nuevoGasto.monto),
      fechaRegistro: new Date().toLocaleDateString("es-PE"),
    };

    setGastos([nuevo, ...gastos]);
    setNuevoGasto({ nombre: "", categoria: "", monto: "" });
    setShowModal(false);
    setCurrentPage(1);
  };

  const handleEditar = (g: Gasto) => {
    setEditGasto({ ...g });
  };

  const handleGuardarEdicion = () => {
    if (editGasto) {
      setGastos(
        gastos.map((g) =>
          g.id === editGasto.id
            ? { ...editGasto, fechaEdicion: new Date().toLocaleDateString("es-PE") }
            : g
        )
      );
      setEditGasto(null);
    }
  };

  return (
    <div className="p-6 bg-[#f9fafb] flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gastos</h1>
        <p className="text-slate-600 text-sm mb-4">
          Gestiona gastos registrados en el sistema.
        </p>

        {/* Año y Mes */}
        <div className="space-y-3 mb-5">
          {/* Selector de años */}
          <div className="flex gap-2 flex-wrap">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition
                ${year === selectedYear
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                  }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Selector de meses */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(index)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition text-center
                ${index === selectedMonth
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
          >
            <PlusIcon className="w-5 h-5" /> Agregar gasto
          </button>
          <div className="w-full md:w-64">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o categoría"
              className="block w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Lista de gastos
        </h2>
        {gastosPag.length === 0 ? (
          <p className="text-sm text-slate-500">No hay gastos.</p>
        ) : (
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
              {gastosPag.map((g, idx) => (
                <tr
                  key={g.id}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50 hover:bg-slate-100"
                  }
                >
                  <td className="px-4 py-2">{g.nombre}</td>
                  <td className="px-4 py-2">{g.categoria}</td>
                  <td className="px-4 py-2">S/ {g.monto.toFixed(2)}</td>
                  <td className="px-4 py-2">{g.fechaRegistro}</td>
                  <td className="px-4 py-2">
                    {g.fechaEdicion ? g.fechaEdicion : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditar(g)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs"
                      >
                        <PencilIcon className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(g.id)}
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
        )}

        {/* Paginación */}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPaginas))}
            disabled={currentPage === totalPaginas || totalPaginas === 0}
            className="flex items-center gap-1 text-sm text-slate-600 disabled:opacity-50"
          >
            Siguiente <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal agregar gasto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Agregar gasto</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAgregar();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoGasto.nombre}
                onChange={(e) =>
                  setNuevoGasto((p) => ({ ...p, nombre: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="text"
                placeholder="Categoría"
                value={nuevoGasto.categoria}
                onChange={(e) =>
                  setNuevoGasto((p) => ({ ...p, categoria: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="number"
                placeholder="Monto"
                value={nuevoGasto.monto}
                onChange={(e) =>
                  setNuevoGasto((p) => ({ ...p, monto: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar gasto */}
      {editGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar gasto</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardarEdicion();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                value={editGasto.nombre}
                onChange={(e) =>
                  setEditGasto((p) => p && { ...p, nombre: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                value={editGasto.categoria}
                onChange={(e) =>
                  setEditGasto((p) => p && { ...p, categoria: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="number"
                value={editGasto.monto}
                onChange={(e) =>
                  setEditGasto(
                    (p) => p && { ...p, monto: parseFloat(e.target.value) }
                  )
                }
                className="w-full border rounded-md p-2"
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditGasto(null)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
