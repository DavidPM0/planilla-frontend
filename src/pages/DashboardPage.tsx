import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Squares2X2Icon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useCallback } from "react";
import useFetchApi from "../hooks/use-fetch"; // Asegúrate de que la ruta sea correcta

// Se registra Chart.js para que funcione con React
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// --- TIPOS DE DATOS DE LA API ---
type ResumenDashboard = {
  ingresoDelMes: number;
  gastoDelMes: number;
  balanceAcumulado: number;
};

type GraficaAnualItem = {
  mes: number;
  ingresos: number;
  gastos: number;
};

// Meses en español
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

// Años disponibles (generados dinámicamente)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

export default function DashboardPage() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  // --- ESTADOS PARA LOS DATOS DE LA API ---
  const [resumenData, setResumenData] = useState<ResumenDashboard | null>(null);
  const [graficaData, setGraficaData] = useState<GraficaAnualItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { get } = useFetchApi();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        anio: selectedYear.toString(),
        mes: (selectedMonth + 1).toString(), // +1 porque getMonth() es base 0 (Enero=0)
      });

      const [resumen, grafica] = await Promise.all([
        get<ResumenDashboard>(`/panel-control/dashboard?${params.toString()}`),
        get<GraficaAnualItem[]>(
          `/panel-control/grafica-anual?anio=${selectedYear}`
        ),
      ]);

      setResumenData(resumen);
      setGraficaData(grafica);
    } catch (err) {
      setError("No se pudieron cargar los datos del dashboard.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [get, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- PREPARACIÓN DE DATOS PARA EL GRÁFICO ---
  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Ingresos",
        data: graficaData.map((d) => d.ingresos),
        backgroundColor: "#6366f1", // indigo-500
        borderRadius: 6,
        barPercentage: 0.5,
      },
      {
        label: "Gastos",
        data: graficaData.map((d) => d.gastos),
        backgroundColor: "#f59e0b", // amber-500
        borderRadius: 6,
        barPercentage: 0.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#374151", // slate-700
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 text-sm">Resumen de ingresos y gastos</p>
      </div>

      {/* Año y Mes */}
      <div className="space-y-3">
        {/* Selector de años */}
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

        {/* Selector de meses */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3">
          {MONTHS.map((month, index) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition text-center ${
                index === selectedMonth
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Ingresos del mes"
          amount={resumenData?.ingresoDelMes || 0}
          icon={<ArrowUpCircleIcon className="w-6 h-6 text-indigo-500" />}
          bgColor="bg-indigo-100"
          textColor="text-indigo-700"
        />
        <Card
          title="Gastos del mes"
          amount={resumenData?.gastoDelMes || 0}
          icon={<ArrowDownCircleIcon className="w-6 h-6 text-amber-500" />}
          bgColor="bg-amber-100"
          textColor="text-amber-700"
        />
        <Card
          title="Balance (Acumulado del año)"
          amount={resumenData?.balanceAcumulado || 0}
          icon={<Squares2X2Icon className="w-6 h-6 text-slate-500" />}
          bgColor="bg-slate-100"
          textColor="text-slate-700"
        />
      </div>

      {/* Gráfico */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-md font-semibold text-slate-700 mb-2">
          Ingresos vs Gastos ({selectedYear})
        </h3>
        <div className="h-72">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE DE TARJETA REUTILIZABLE ---
function Card({
  title,
  amount,
  icon,
  bgColor,
  textColor,
}: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div
      className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${bgColor}`}
    >
      <div>
        <h4 className="text-sm text-slate-500">{title}</h4>
        <p className={`text-2xl font-bold ${textColor}`}>
          S/{" "}
          {amount.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="p-2 rounded-full bg-white shadow">{icon}</div>
    </div>
  );
}
