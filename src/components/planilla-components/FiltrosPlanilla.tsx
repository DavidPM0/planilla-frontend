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
  isLoading: boolean;
}

export default function FiltrosPlanilla({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
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
    </>
  );
}
