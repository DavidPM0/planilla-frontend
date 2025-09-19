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
  onProcesar: () => void; // Legacy function
  onProcesarPrimeraQuincena: () => void;
  onProcesarSegundaQuincena: () => void;
  onProcesarMensual: () => void;
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
  onProcesar, // Legacy
  onProcesarPrimeraQuincena,
  onProcesarSegundaQuincena,
  onProcesarMensual,
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

      {/* Botones de acción para generar planillas */}
      <div className="flex flex-col gap-4">
        {!planillaProcesada && !isLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              🎯 Generar Planillas por Tipo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={onProcesarPrimeraQuincena}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4" />
                Primera Quincena (1-15)
              </button>

              <button
                onClick={onProcesarSegundaQuincena}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4" />
                Segunda Quincena (16-30)
              </button>

              <button
                onClick={onProcesarMensual}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4" />
                Mensual (Todo el mes)
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200">
              <button
                onClick={onProcesar}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition disabled:opacity-50 w-full"
              >
                <PlusIcon className="w-4 h-4" />
                {isLoading ? "Procesando..." : "🔄 Procesar Todas (Legacy)"}
              </button>
              <p className="text-xs text-slate-500 mt-1 text-center">
                ⚠️ Método antiguo - Genera todas las planillas de una vez
              </p>
            </div>
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
