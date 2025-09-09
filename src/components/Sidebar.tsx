// src/components/Sidebar.tsx
import {
  HomeIcon,
  ClipboardDocumentIcon,
  TagIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import profileImage from "../assets/profile.jpg";

const navigation = [
  { name: "Inicio", icon: HomeIcon, href: "/" },
  { name: "Planilla", icon: ClipboardDocumentIcon, href: "/planilla" },
  { name: "Categorías de Ingresos", icon: TagIcon, href: "/categorias-ingresos" },
  { name: "Ingresos", icon: ArrowDownTrayIcon, href: "/ingresos" },
  { name: "Categorías de Gastos", icon: TagIcon, href: "/categorias-gastos" },
  { name: "Gastos", icon: ArrowUpTrayIcon, href: "/gastos" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !(profileRef.current as any).contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between relative">
      <div>
        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1] transition cursor-pointer"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Sección inferior (cuenta) */}
      <div className="px-4 py-6 space-y-2">
        {/* Botón de usuarios */}
        <button
          onClick={() => console.log("Settings")}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1] transition cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          Usuarios
        </button>

        {/* Botón de perfil con dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1] transition cursor-pointer"
          >
            <img
              src={profileImage}
              alt="User"
              className="w-9 h-9 rounded-full object-cover border border-gray-300"
            />
            <div className="text-left">
              <p className="text-sm font-semibold">Clarissa Dexter</p>
              <p className="text-xs text-gray-500">Chief Finance Officer</p>
            </div>
          </button>

          {/* Mini popup / dropdown */}
          {showDropdown && (
  <div className="absolute left-full bottom-0 mb-2 ml-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 px-2 py-2">
    <button
      onClick={() => {
        setShowDropdown(false);
        console.log("Ir al perfil");
      }}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1] rounded-md transition cursor-pointer"
    >
      <UserIcon className="w-5 h-5" />
      Ver perfil
    </button>
    <button
      onClick={() => {
        setShowDropdown(false);
        console.log("Cerrar sesión");
      }}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1] rounded-md transition cursor-pointer"
    >
      <ArrowUpTrayIcon className="w-5 h-5 text-red-400" />
      Cerrar sesión
    </button>
  </div>
)}

        </div>
      </div>
    </aside>
  );
}
