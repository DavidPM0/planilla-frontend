import { PlusIcon } from "@heroicons/react/24/outline";

// Constantes (puedes importarlas de un archivo compartido)
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
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

interface FiltrosPlanillaProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  busqueda: string;
  setBusqueda: (search: string) => void;
  onProcesar: () => void;
  planillaProcesada: boolean;
  isLoading: boolean;
}

export default function FiltrosPlanilla({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  busqueda,
  setBusqueda,
  onProcesar,
  planillaProcesada,
  isLoading,
}: FiltrosPlanillaProps) {
  return (
    <>
      {/* Año y Mes */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              disabled={isLoading}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                year === selectedYear
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3">
          {MONTHS.map((month, index) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(index + 1)} // Usamos mes base 1
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition text-center ${
                index + 1 === selectedMonth
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Botón de acción principal y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {!planillaProcesada && !isLoading ? (
          <button
            onClick={onProcesar}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            {isLoading ? "Procesando..." : "Generar Planilla"}
          </button>
        ) : (
          <div className="w-48 h-9 hidden md:block"></div>
        )}

        <div className="w-full md:w-64">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={isLoading}
            placeholder="Buscar por nombre, cuenta o banco"
            className="block w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          />
        </div>
      </div>
    </>
  );
}
