import {
  HomeIcon,
  ClipboardDocumentIcon,
  TagIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  UserIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import profileImage from "../assets/profile.jpg";
import { useAuth } from "../context/auth-context";

const navigation = [
  { name: "Dashboard", icon: HomeIcon, href: "/" },
  { name: "Planilla", icon: ClipboardDocumentIcon, href: "/planilla" },
  {
    name: "Categorías de Ingresos",
    icon: TagIcon,
    href: "/categorias-ingresos",
  },
  { name: "Ingresos", icon: ArrowDownTrayIcon, href: "/ingresos" },
  { name: "Categorías de Gastos", icon: TagIcon, href: "/categorias-gastos" },
  { name: "Gastos", icon: ArrowUpTrayIcon, href: "/gastos" },
  {
    name: "Trabajadores",
    icon: ClipboardDocumentListIcon,
    href: "/trabajadores",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef(null);
  const { logout, user } = useAuth();

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

  const handleLogout = async () => {
    try {
      setShowDropdown(false);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between relative">
      <div>
        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer ${
                  isActive
                    ? "bg-indigo-100 text-[#6366f1]"
                    : "text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1]"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sección inferior (cuenta) */}
      <div className="px-4 py-6 space-y-2">
        {/* Botón de usuarios */}
        {user?.perfiles && user.perfiles.includes("administrador") && (
          <NavLink
            to="/usuarios"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer ${
                isActive
                  ? "bg-indigo-100 text-[#6366f1]"
                  : "text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1]"
              }`
            }
          >
            <UserIcon className="w-5 h-5" />
            Usuarios
          </NavLink>
        )}

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
              <p className="text-sm font-semibold">
                {user?.nombres} {user?.apellidoPaterno}
              </p>
              <p className="text-xs text-gray-500">
                {user?.perfiles.join(", ")}
              </p>
            </div>
          </button>

          {/* Mini popup / dropdown */}
          {showDropdown && (
            <div className="absolute left-full bottom-0 mb-2 ml-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 px-2 py-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/perfil"); // 👈 redirige al perfil
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-100 hover:text-[#6366f1] rounded-md transition cursor-pointer"
              >
                <UserIcon className="w-5 h-5" />
                Ver perfil
              </button>
              <button
                onClick={() => {
                  // setShowDropdown(false);
                  // console.log("Cerrar sesión");
                  // 👉 si quieres, aquí puedes hacer navigate("/login")
                  handleLogout();
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
