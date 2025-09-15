// src/pages/DashboardPage.tsx
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
import { useState } from "react";

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Meses en español
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Años disponibles
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2021 }, (_, i) => 2022 + i);

// Datos de prueba por año y mes
const sampleData: {
  [year: number]: {
    ingresos: number[];
    gastos: number[];
  };
} = {
  2022: {
    ingresos: [6000, 7200, 8000, 7500, 9000, 8800, 9100, 9400, 9200, 9500, 9700, 9900],
    gastos:   [4000, 5000, 5200, 5300, 5500, 5600, 5700, 5900, 5800, 6000, 6100, 6200],
  },
  2023: {
    ingresos: [8500, 9000, 9500, 10000, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500],
    gastos:   [5000, 5500, 5800, 6000, 6200, 6400, 6600, 6800, 7000, 7200, 7400, 7600],
  },
  2024: {
    ingresos: [10000, 10500, 11000, 12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500, 16000],
    gastos:   [6000, 6500, 6700, 6900, 7100, 7300, 7500, 7700, 7900, 8100, 8300, 8500],
  },
};

export default function DashboardPage() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const currentData = sampleData[selectedYear] || { ingresos: [], gastos: [] };
  const currentMonthIncome = currentData.ingresos[selectedMonth] || 0;
  const currentMonthExpense = currentData.gastos[selectedMonth] || 0;

  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Ingresos",
        data: currentData.ingresos,
        backgroundColor: "#6366f1", // indigo-500
        borderRadius: 6,
        barPercentage: 0.5,
      },
      {
        label: "Gastos",
        data: currentData.gastos,
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

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Ingresos del mes"
          amount={currentMonthIncome}
          icon={<ArrowUpCircleIcon className="w-6 h-6 text-indigo-500" />}
          bgColor="bg-indigo-100"
          textColor="text-indigo-700"
        />
        <Card
          title="Gastos del mes"
          amount={currentMonthExpense}
          icon={<ArrowDownCircleIcon className="w-6 h-6 text-amber-500" />}
          bgColor="bg-amber-100"
          textColor="text-amber-700"
        />
        <Card
          title="Balance"
          amount={currentMonthIncome - currentMonthExpense}
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

// Tarjeta reutilizable
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
    <div className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${bgColor}`}>
      <div>
        <h4 className="text-sm text-slate-500">{title}</h4>
        <p className={`text-xl font-bold ${textColor}`}>
          ${amount.toLocaleString()}
        </p>
      </div>
      <div className="p-2 rounded-full bg-white shadow">{icon}</div>
    </div>
  );
}
