import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

type Usuario = {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  rol: string;
  contrasena: string;
  fechaRegistro: Date;
  fechaModificacion: Date | null;
};

const rolesDisponibles = ["Admin", "Usuario", "Invitado", "Editor", "Lector"];

export default function UsuariosPage() {
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [rol, setRol] = useState(rolesDisponibles[1]);
  const [filtro, setFiltro] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usuariosPorPagina = 9;

  // Generar contraseña segura de ejemplo
  const generarContrasena = () => {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length: 12 }, () =>
      caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    ).join("");
  };

  // Filtrado
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.correo.toLowerCase().includes(filtro.toLowerCase()) ||
      u.rol.toLowerCase().includes(filtro.toLowerCase()) ||
      u.nombres.toLowerCase().includes(filtro.toLowerCase())
  );

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const startIndex = (currentPage - 1) * usuariosPorPagina;
  const currentUsuarios = usuariosFiltrados.slice(
    startIndex,
    startIndex + usuariosPorPagina
  );

  // Validar correo simple
  const esCorreoValido = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Agregar usuario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombres.trim() || !apellidoPaterno.trim() || !apellidoMaterno.trim()) {
      alert("Por favor completa todos los campos de nombres y apellidos.");
      return;
    }
    if (!esCorreoValido(correo)) {
      alert("Por favor ingresa un correo válido.");
      return;
    }
    if (contrasena.trim().length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (usuarios.some((u) => u.correo.toLowerCase() === correo.toLowerCase())) {
      alert("Ya existe un usuario con ese correo.");
      return;
    }

    const nuevoUsuario: Usuario = {
      id: usuarios.length + 1,
      nombres: nombres.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: apellidoMaterno.trim(),
      correo: correo.trim(),
      rol,
      contrasena,
      fechaRegistro: new Date(),
      fechaModificacion: null,
    };

    setUsuarios([nuevoUsuario, ...usuarios]);
    setNombres("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setCorreo("");
    setContrasena("");
    setRol(rolesDisponibles[1]);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#f9fafb] flex flex-col min-h-screen">
      {/* Encabezado */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-slate-600 text-sm">
          Administra los usuarios registrados
        </p>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {/* Formulario y buscador */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 space-y-4 max-w-3xl w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className="input-field"
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  className="input-field"
                  placeholder="Ej: Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  className="input-field"
                  placeholder="Ej: Gómez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="input-field"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-500"
                >
                  {mostrarContrasena ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <p
                  className="text-xs text-slate-500 mt-1 cursor-pointer hover:text-indigo-500"
                  onClick={() => setContrasena(generarContrasena())}
                >
                  Generar contraseña segura
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="input-field"
                >
                  {rolesDisponibles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar usuario
            </button>
          </form>

          {/* Buscador */}
          <div className="relative text-slate-400 focus-within:text-indigo-500">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar usuario
            </label>
            <div className="relative">
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nombre, correo o rol..."
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

        {/* Tabla de usuarios */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold text-slate-700 mb-4">
            Usuarios registrados
          </h3>

          {usuariosFiltrados.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay usuarios que coincidan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-slate-600">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nombres</th>
                    <th className="px-4 py-3">Apellido Paterno</th>
                    <th className="px-4 py-3">Apellido Materno</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Fecha creación</th>
                    <th className="px-4 py-3">Última modificación</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsuarios.map((u, index) => (
                    <tr
                      key={u.id}
                      className={
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50 hover:bg-slate-100"
                      }
                    >
                      <td className="px-4 py-2">{u.id}</td>
                      <td className="px-4 py-2">{u.nombres}</td>
                      <td className="px-4 py-2">{u.apellidoPaterno}</td>
                      <td className="px-4 py-2">{u.apellidoMaterno}</td>
                      <td className="px-4 py-2">{u.correo}</td>
                      <td className="px-4 py-2">{u.rol}</td>
                      <td className="px-4 py-2">
                        {u.fechaRegistro.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {u.fechaModificacion
                          ? u.fechaModificacion.toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full transition cursor-pointer">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 p-1 rounded-full transition cursor-pointer">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Anterior
                </button>
                <span className="text-sm text-slate-600">
                  Página {currentPage} de {totalPaginas || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={currentPage === totalPaginas || totalPaginas === 0}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
