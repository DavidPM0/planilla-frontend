import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  MinusCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type HistorialItem = {
  id: number;
  tipo: "Adelanto" | "Descuento" | "Pago";
  monto: number;
  motivo?: string;
  fecha: string;
};

type Empleado = {
  id: number;
  nombre: string;
  apellido: string;
  cuenta: string;
  banco: string;
  fechaPagar: string;
  tipoPago: "Mensual" | "Quincenal";
  monto: number;
  fechaRegistro: string;
  fechaEdicion?: string;
  historial: HistorialItem[];
};

// Meses en español
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Años disponibles
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2021 }, (_, i) => 2022 + i);

export default function PlanillaPage() {
  const today = new Date();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [empleados, setEmpleados] = useState<Empleado[]>([
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      cuenta: "123-456-789",
      banco: "BCP",
      fechaPagar: "30/09/2025",
      tipoPago: "Mensual",
      monto: 2500,
      fechaRegistro: "01/07/2025",
      historial: [
        {
          id: 1,
          tipo: "Adelanto",
          monto: 500,
          motivo: "Emergencia",
          fecha: "05/09/2025",
        },
        {
          id: 2,
          tipo: "Pago",
          monto: 2000,
          fecha: "30/09/2025",
        },
      ],
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const empleadosPorPagina = 5;
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showHistorial, setShowHistorial] = useState<Empleado | null>(null);
  const [editEmpleado, setEditEmpleado] = useState<Empleado | null>(null);

  // Nuevo empleado
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    cuenta: "",
    banco: "",
    fechaPagar: "",
    tipoPago: "Mensual" as "Mensual" | "Quincenal",
    monto: "",
  });

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.cuenta.includes(busqueda) ||
      emp.banco.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);
  const startIndex = (currentPage - 1) * empleadosPorPagina;
  const empleadosPag = empleadosFiltrados.slice(
    startIndex,
    startIndex + empleadosPorPagina
  );

  // Funciones
  const handleEliminar = (id: number) => {
    if (confirm("¿Eliminar este empleado?")) {
      setEmpleados(empleados.filter((e) => e.id !== id));
    }
  };

  const handleAgregar = () => {
    if (
      !nuevoEmpleado.nombre.trim() ||
      !nuevoEmpleado.apellido.trim() ||
      !nuevoEmpleado.cuenta.trim() ||
      !nuevoEmpleado.banco.trim() ||
      !nuevoEmpleado.fechaPagar.trim() ||
      !nuevoEmpleado.monto.trim()
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    const nuevo: Empleado = {
      id: empleados.length ? empleados[empleados.length - 1].id + 1 : 1,
      nombre: nuevoEmpleado.nombre.trim(),
      apellido: nuevoEmpleado.apellido.trim(),
      cuenta: nuevoEmpleado.cuenta.trim(),
      banco: nuevoEmpleado.banco.trim(),
      fechaPagar: nuevoEmpleado.fechaPagar.trim(),
      tipoPago: nuevoEmpleado.tipoPago,
      monto: parseFloat(nuevoEmpleado.monto),
      fechaRegistro: new Date().toLocaleDateString("es-PE"),
      historial: [],
    };

    setEmpleados([nuevo, ...empleados]);
    setNuevoEmpleado({
      nombre: "",
      apellido: "",
      cuenta: "",
      banco: "",
      fechaPagar: "",
      tipoPago: "Mensual",
      monto: "",
    });
    setShowModal(false);
    setCurrentPage(1);
  };

  const handleAccion = (
    id: number,
    tipo: "Adelanto" | "Descuento" | "Pago"
  ) => {
    const monto = prompt(`Monto del ${tipo}:`);
    if (!monto || isNaN(parseFloat(monto))) return;

    const motivo =
      tipo === "Pago" ? undefined : prompt("Motivo (opcional):") || undefined;

    const nuevaAccion: HistorialItem = {
      id: Date.now(),
      tipo,
      monto: parseFloat(monto),
      motivo,
      fecha: new Date().toLocaleDateString("es-PE"),
    };

    setEmpleados(
      empleados.map((e) =>
        e.id === id ? { ...e, historial: [nuevaAccion, ...e.historial] } : e
      )
    );
  };

  const getEstadoPago = (emp: Empleado) => {
    const totalPagos = emp.historial
      .filter((h) => h.tipo === "Pago")
      .reduce((acc, h) => acc + h.monto, 0);
    const totalAdelantos = emp.historial
      .filter((h) => h.tipo === "Adelanto")
      .reduce((acc, h) => acc + h.monto, 0);

    if (totalPagos >= emp.monto || totalAdelantos >= emp.monto) {
      return "Pagado";
    }
    return "Pendiente";
  };

  const handleEditar = (emp: Empleado) => {
    setEditEmpleado({ ...emp });
  };

  const handleGuardarEdicion = () => {
    if (editEmpleado) {
      setEmpleados(
        empleados.map((e) => (e.id === editEmpleado.id ? editEmpleado : e))
      );
      setEditEmpleado(null);
    }
  };

  return (
    <div className="p-6 bg-[#f9fafb] flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Planilla</h1>
        <p className="text-slate-600 text-sm mb-4">
          Gestiona empleados, bancos y movimientos de pago.
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
            <PlusIcon className="w-5 h-5" /> Agregar empleado
          </button>
          <div className="w-full md:w-64">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, cuenta o banco"
              className="block w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Lista de empleados
        </h2>
        {empleadosPag.length === 0 ? (
          <p className="text-sm text-slate-500">No hay empleados.</p>
        ) : (
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-4 py-3">Nombres</th>
                <th className="px-4 py-3">Apellidos</th>
                <th className="px-4 py-3">Banco</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3">Monto base</th>
                <th className="px-4 py-3">Fecha a pagar</th>
                <th className="px-4 py-3">Tipo pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
                <th className="px-4 py-3 text-center">Historial</th>
              </tr>
            </thead>
            <tbody>
              {empleadosPag.map((emp, idx) => (
                <tr
                  key={emp.id}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50 hover:bg-slate-100"
                  }
                >
                  <td className="px-4 py-2">{emp.nombre}</td>
                  <td className="px-4 py-2">{emp.apellido}</td>
                  <td className="px-4 py-2">{emp.banco}</td>
                  <td className="px-4 py-2">{emp.cuenta}</td>
                  <td className="px-4 py-2">S/ {emp.monto.toFixed(2)}</td>
                  <td className="px-4 py-2">{emp.fechaPagar}</td>
                  <td className="px-4 py-2">{emp.tipoPago}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      getEstadoPago(emp) === "Pagado"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {getEstadoPago(emp)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => handleAccion(emp.id, "Adelanto")}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs"
                      >
                        <BanknotesIcon className="w-4 h-4" /> Adelanto
                      </button>
                      <button
                        onClick={() => handleAccion(emp.id, "Descuento")}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs"
                      >
                        <MinusCircleIcon className="w-4 h-4" /> Descuento
                      </button>
                      <button
                        onClick={() => handleAccion(emp.id, "Pago")}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                      >
                        <CurrencyDollarIcon className="w-4 h-4" /> Pago
                      </button>
                      <button
                        onClick={() => handleEditar(emp)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs"
                      >
                        <PencilIcon className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(emp.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-xs"
                      >
                        <TrashIcon className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setShowHistorial(emp)}
                      className="flex items-center gap-1 px-3 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs"
                    >
                      <ClockIcon className="w-4 h-4" /> Ver historial
                    </button>
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

      {/* Popup historial */}
      {showHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-3 text-slate-700">
              Historial de {showHistorial.nombre} {showHistorial.apellido}
            </h3>
            {showHistorial.historial.length === 0 ? (
              <p className="text-sm text-slate-500">Sin movimientos.</p>
            ) : (
              <ul className="divide-y max-h-64 overflow-y-auto">
                {showHistorial.historial.map((h) => (
                  <li key={h.id} className="py-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        <strong>{h.tipo}</strong> — S/ {h.monto}
                        {h.motivo && ` (${h.motivo})`}
                      </span>
                      <span className="text-slate-500">{h.fecha}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHistorial(null)}
                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar empleado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Agregar empleado</h3>
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
                value={nuevoEmpleado.nombre}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({ ...p, nombre: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="text"
                placeholder="Apellido"
                value={nuevoEmpleado.apellido}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({ ...p, apellido: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="text"
                placeholder="Banco"
                value={nuevoEmpleado.banco}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({ ...p, banco: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="text"
                placeholder="Nº cuenta"
                value={nuevoEmpleado.cuenta}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({ ...p, cuenta: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="text"
                placeholder="Fecha a pagar (DD/MM/AAAA)"
                value={nuevoEmpleado.fechaPagar}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({ ...p, fechaPagar: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="number"
                placeholder="Monto base"
                value={nuevoEmpleado.monto}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({ ...p, monto: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                required
              />
              <select
                value={nuevoEmpleado.tipoPago}
                onChange={(e) =>
                  setNuevoEmpleado((p) => ({
                    ...p,
                    tipoPago: e.target.value as "Mensual" | "Quincenal",
                  }))
                }
                className="w-full border rounded-md p-2"
              >
                <option value="Mensual">Mensual</option>
                <option value="Quincenal">Quincenal</option>
              </select>

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

      {/* Modal editar empleado */}
      {editEmpleado && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar empleado</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardarEdicion();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                value={editEmpleado.nombre}
                onChange={(e) =>
                  setEditEmpleado((p) => p && { ...p, nombre: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                value={editEmpleado.apellido}
                onChange={(e) =>
                  setEditEmpleado((p) => p && { ...p, apellido: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                value={editEmpleado.banco}
                onChange={(e) =>
                  setEditEmpleado((p) => p && { ...p, banco: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                value={editEmpleado.cuenta}
                onChange={(e) =>
                  setEditEmpleado((p) => p && { ...p, cuenta: e.target.value })
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                value={editEmpleado.fechaPagar}
                onChange={(e) =>
                  setEditEmpleado(
                    (p) => p && { ...p, fechaPagar: e.target.value }
                  )
                }
                className="w-full border rounded-md p-2"
              />
              <input
                type="number"
                value={editEmpleado.monto}
                onChange={(e) =>
                  setEditEmpleado(
                    (p) => p && { ...p, monto: parseFloat(e.target.value) }
                  )
                }
                className="w-full border rounded-md p-2"
              />
              <select
                value={editEmpleado.tipoPago}
                onChange={(e) =>
                  setEditEmpleado(
                    (p) =>
                      p && {
                        ...p,
                        tipoPago: e.target.value as "Mensual" | "Quincenal",
                      }
                  )
                }
                className="w-full border rounded-md p-2"
              >
                <option value="Mensual">Mensual</option>
                <option value="Quincenal">Quincenal</option>
              </select>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditEmpleado(null)}
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
