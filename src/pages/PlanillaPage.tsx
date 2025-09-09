import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type Empleado = {
  id: number;
  nombre: string;
  apellido: string;
  cuenta: string;
  fechaPagar: string;
  tipoPago: "Mensual" | "Quincenal";
  fechas: string[];
};

export default function PlanillaPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      cuenta: "123-456-789",
      fechaPagar: "30/09/2025",
      tipoPago: "Mensual",
      fechas: ["30/08/2025", "31/07/2025"],
    },
    {
      id: 2,
      nombre: "Lucía",
      apellido: "Ramírez",
      cuenta: "987-654-321",
      fechaPagar: "15/09/2025",
      tipoPago: "Quincenal",
      fechas: ["01/09/2025", "15/08/2025"],
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const empleadosPorPagina = 5;

  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Campos para nuevo empleado
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    cuenta: "",
    fechaPagar: "",
    tipoPago: "Mensual" as "Mensual" | "Quincenal",
    fechas: "",
  });

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = empleados.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.cuenta.includes(busqueda)
  );

  const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);
  const startIndex = (currentPage - 1) * empleadosPorPagina;
  const empleadosPag = empleadosFiltrados.slice(
    startIndex,
    startIndex + empleadosPorPagina
  );

  // Funciones

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este empleado?")) {
      setEmpleados(empleados.filter((e) => e.id !== id));
      // Ajustar página si fuera necesario
      if (
        empleadosFiltrados.length % empleadosPorPagina === 1 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleEditar = (id: number) => {
    const emp = empleados.find((e) => e.id === id);
    if (!emp) return;

    // Aquí se podría abrir un modal o usar prompt para editar
    const nuevoNombre = prompt("Editar nombre:", emp.nombre);
    if (!nuevoNombre || nuevoNombre.trim() === "") return;

    const nuevoApellido = prompt("Editar apellido:", emp.apellido);
    if (!nuevoApellido || nuevoApellido.trim() === "") return;

    setEmpleados(
      empleados.map((e) =>
        e.id === id ? { ...e, nombre: nuevoNombre.trim(), apellido: nuevoApellido.trim() } : e
      )
    );
  };

  const handleAgregar = () => {
    // Validaciones básicas
    if (
      !nuevoEmpleado.nombre.trim() ||
      !nuevoEmpleado.apellido.trim() ||
      !nuevoEmpleado.cuenta.trim() ||
      !nuevoEmpleado.fechaPagar.trim()
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Convertir fechas input a array, separado por comas
    const fechasArray = nuevoEmpleado.fechas
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "");

    const nuevo: Empleado = {
      id: empleados.length ? empleados[empleados.length - 1].id + 1 : 1,
      nombre: nuevoEmpleado.nombre.trim(),
      apellido: nuevoEmpleado.apellido.trim(),
      cuenta: nuevoEmpleado.cuenta.trim(),
      fechaPagar: nuevoEmpleado.fechaPagar.trim(),
      tipoPago: nuevoEmpleado.tipoPago,
      fechas: fechasArray,
    };

    setEmpleados([nuevo, ...empleados]);
    setNuevoEmpleado({
      nombre: "",
      apellido: "",
      cuenta: "",
      fechaPagar: "",
      tipoPago: "Mensual",
      fechas: "",
    });
    setShowModal(false);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-[#f9fafb] flex flex-col space-y-6">
      {/* Header y descripción */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Planilla</h1>
        <p className="text-slate-600 text-sm mb-4">
          Aquí podrás gestionar la nómina de empleados.
        </p>

        {/* Controles: botón agregar y buscador */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar empleado
          </button>

          <div className="w-full md:w-64 relative">
            <label
              htmlFor="buscar"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Buscar empleado
            </label>
            <div className="relative text-slate-400 focus-within:text-indigo-500">
              <input
                id="buscar"
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setCurrentPage(1); // reset página al buscar
                }}
                placeholder="Buscar por nombre, apellido o cuenta"
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
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Lista de empleados
        </h2>

        {empleadosPag.length === 0 ? (
          <p className="text-sm text-slate-500">No hay empleados que mostrar.</p>
        ) : (
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-4 py-3">Nombres</th>
                <th className="px-4 py-3">Apellidos</th>
                <th className="px-4 py-3">Nº de cuenta</th>
                <th className="px-4 py-3">Fecha a pagar</th>
                <th className="px-4 py-3">Tipo de pago</th>
                <th className="px-4 py-3">Fechas de pago</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosPag.map((emp, idx) => (
                <tr
                  key={emp.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50 hover:bg-slate-100"}
                >
                  <td className="px-4 py-2">{emp.nombre}</td>
                  <td className="px-4 py-2">{emp.apellido}</td>
                  <td className="px-4 py-2">{emp.cuenta}</td>
                  <td className="px-4 py-2">{emp.fechaPagar}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.tipoPago === "Mensual"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {emp.tipoPago}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {emp.fechas.map((f, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs bg-slate-200 text-slate-700 rounded px-2 py-1 mr-1 mb-1"
                      >
                        {f}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        title="Editar"
                        onClick={() => handleEditar(emp.id)}
                        className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full transition"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => handleEliminar(emp.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full transition"
                      >
                        <TrashIcon className="w-5 h-5" />
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
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {currentPage} de {totalPaginas || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPaginas))}
            disabled={currentPage === totalPaginas || totalPaginas === 0}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50"
          >
            Siguiente
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal para agregar empleado */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
              <h3 className="text-lg font-semibold mb-4">Agregar nuevo empleado</h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAgregar();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) =>
                      setNuevoEmpleado((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={nuevoEmpleado.apellido}
                    onChange={(e) =>
                      setNuevoEmpleado((prev) => ({
                        ...prev,
                        apellido: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nº de cuenta *
                  </label>
                  <input
                    type="text"
                    value={nuevoEmpleado.cuenta}
                    onChange={(e) =>
                      setNuevoEmpleado((prev) => ({
                        ...prev,
                        cuenta: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Fecha a pagar *
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={nuevoEmpleado.fechaPagar}
                    onChange={(e) =>
                      setNuevoEmpleado((prev) => ({
                        ...prev,
                        fechaPagar: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tipo de pago *
                  </label>
                  <select
                    value={nuevoEmpleado.tipoPago}
                    onChange={(e) =>
                      setNuevoEmpleado((prev) => ({
                        ...prev,
                        tipoPago: e.target.value as "Mensual" | "Quincenal",
                      }))
                    }
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Quincenal">Quincenal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Fechas de pago (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA, DD/MM/AAAA"
                    value={nuevoEmpleado.fechas}
                    onChange={(e) =>
                      setNuevoEmpleado((prev) => ({
                        ...prev,
                        fechas: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
