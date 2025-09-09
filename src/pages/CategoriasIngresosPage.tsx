import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type Categoria = {
  id: number;
  nombre: string;
  cantidadIngresos: number;
};

export default function CategoriasIngresosPage() {
  const [nombre, setNombre] = useState("");
  const [filtro, setFiltro] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriasPorPagina = 9;

  // Filtrado
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // Paginación
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);
  const startIndex = (currentPage - 1) * categoriasPorPagina;
  const currentCategorias = categoriasFiltradas.slice(startIndex, startIndex + categoriasPorPagina);

  // Agregar nueva categoría
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() === "") return;

    const nuevaCategoria: Categoria = {
      id: categorias.length + 1,
      nombre: nombre.trim(),
      cantidadIngresos: Math.floor(Math.random() * 10), // Simulado
    };

    setCategorias([nuevaCategoria, ...categorias]);
    setNombre("");
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    setCategorias(categorias.filter((cat) => cat.id !== id));
  };

  const handleEdit = (id: number) => {
    const categoria = categorias.find((c) => c.id === id);
    if (!categoria) return;
    const nuevoNombre = prompt("Editar nombre de categoría:", categoria.nombre);
    if (nuevoNombre && nuevoNombre.trim() !== "") {
      setCategorias(
        categorias.map((cat) =>
          cat.id === id ? { ...cat, nombre: nuevoNombre.trim() } : cat
        )
      );
    }
  };

  return (
    <div className="bg-[#f9fafb] flex flex-col">
      {/* Encabezado */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">Categorías de Ingresos</h1>
        <p className="text-slate-600 text-sm">Administra las categorías para tus ingresos</p>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {/* Formulario y buscador */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 space-y-4 max-w-md w-full"
          >
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
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

            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar categoría
            </button>
          </form>

          {/* Buscador */}
          <div className="w-full md:w-64 relative">
  <label htmlFor="buscar" className="block text-sm font-medium text-slate-700 mb-1">
    Buscar categoría
  </label>
  <div className="relative text-slate-400 focus-within:text-indigo-500">
    <input
      id="buscar"
      type="text"
      value={filtro}
      onChange={(e) => setFiltro(e.target.value)}
      placeholder="Buscar categoría..."
      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          <h3 className="text-md font-semibold text-slate-700 mb-4">Categorías registradas</h3>

          {categoriasFiltradas.length === 0 ? (
            <p className="text-sm text-slate-500">No hay categorías que coincidan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-slate-600">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3 text-center">Cantidad</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategorias.map((cat, index) => (
                    <tr
                      key={cat.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50 hover:bg-slate-100"}
                    >
                      <td className="px-4 py-2">{cat.id}</td>
                      <td className="px-4 py-2">{cat.nombre}</td>
                      <td className="px-4 py-2 text-center">{cat.cantidadIngresos}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            title="Editar"
                            onClick={() => handleEdit(cat.id)}
                            className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full transition cursor-pointer"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full transition cursor-pointer"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Anterior
                </button>
                <span className="text-sm text-slate-600">
                  Página {currentPage} de {totalPaginas || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                  disabled={currentPage === totalPaginas || totalPaginas === 0}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
