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
// Lógica simple: desde 2025 hacia adelante, preservando siempre el año base
const currentYear = new Date().getFullYear();
const BASE_YEAR = 2025; // Año base que NUNCA desaparece
const endYear = Math.max(currentYear + 2, 2035); // Al menos hasta 2035
const YEARS = Array.from(
  { length: endYear - BASE_YEAR + 1 },
  (_, i) => BASE_YEAR + i
);
interface FiltrosPlanillaProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  busqueda: string;
  setBusqueda: (search: string) => void;
  onProcesar: () => void;
  onRegenerarPlanilla: () => void;
  planillaProcesada: boolean;
  planillaSeleccionada?: any;
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
  onRegenerarPlanilla,
  planillaProcesada,
  planillaSeleccionada,
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

      {/* Botones de acción para completar planillas */}
      <div className="flex flex-col gap-4">
        {!planillaProcesada && !isLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              ⚡ Completar Planillas
            </h3>
            <button
              onClick={onProcesar}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 w-full"
            >
              <PlusIcon className="w-5 h-5" />
              {isLoading ? "Procesando..." : "Completar Planillas Faltantes"}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Crea automáticamente los períodos faltantes (Mensual, Primera
              Quincena, Segunda Quincena) según los contratos disponibles
            </p>
          </div>
        ) : planillaProcesada && planillaSeleccionada ? (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              🔄 Opciones de Planilla Seleccionada
            </h3>
            <div className="flex gap-3">
              <button
                onClick={onRegenerarPlanilla}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
              >
                🔄 Regenerar Planilla
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Regenera la planilla seleccionada con cálculos actualizados
            </p>
          </div>
        ) : (
          <div className="w-full h-4 hidden md:block"></div>
        )}

        {/* Búsqueda */}
        <div className="flex justify-end">
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
      </div>
    </>
  );
}
