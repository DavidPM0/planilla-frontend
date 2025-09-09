import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type Usuario = {
  id: number;
  correo: string;
  rol: string;
  fechaRegistro: Date;
  fechaModificacion: Date | null;
};

const rolesDisponibles = ["Admin", "Usuario", "Invitado"];

export default function UsuariosPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState(rolesDisponibles[1]);
  const [filtro, setFiltro] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usuariosPorPagina = 9;

  // Filtrado por correo o rol
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.correo.toLowerCase().includes(filtro.toLowerCase()) ||
      u.rol.toLowerCase().includes(filtro.toLowerCase())
  );

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const startIndex = (currentPage - 1) * usuariosPorPagina;
  const currentUsuarios = usuariosFiltrados.slice(startIndex, startIndex + usuariosPorPagina);

  // Validar correo simple
  const esCorreoValido = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Agregar usuario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!esCorreoValido(correo)) {
      alert("Por favor ingresa un correo válido.");
      return;
    }
    if (contrasena.trim().length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Evitar correos duplicados
    if (usuarios.some((u) => u.correo.toLowerCase() === correo.toLowerCase())) {
      alert("Ya existe un usuario con ese correo.");
      return;
    }

    const nuevoUsuario: Usuario = {
      id: usuarios.length + 1,
      correo: correo.trim(),
      rol,
      fechaRegistro: new Date(),
      fechaModificacion: null,
    };

    setUsuarios([nuevoUsuario, ...usuarios]);
    setCorreo("");
    setContrasena("");
    setRol(rolesDisponibles[1]);
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este usuario?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    const nuevoCorreo = prompt("Editar correo:", usuario.correo);
    if (!nuevoCorreo || !esCorreoValido(nuevoCorreo.trim())) {
      alert("Correo inválido o vacío.");
      return;
    }
    const nuevoRol = prompt(
      `Editar rol (Admin, Usuario, Invitado):`,
      usuario.rol
    );
    if (!nuevoRol || !rolesDisponibles.includes(nuevoRol.trim())) {
      alert("Rol inválido o vacío.");
      return;
    }

    // Evitar duplicados en edición
    if (
      usuarios.some(
        (u) => u.correo.toLowerCase() === nuevoCorreo.trim().toLowerCase() && u.id !== id
      )
    ) {
      alert("Ya existe otro usuario con ese correo.");
      return;
    }

    setUsuarios(
      usuarios.map((u) =>
        u.id === id
          ? {
              ...u,
              correo: nuevoCorreo.trim(),
              rol: nuevoRol.trim(),
              fechaModificacion: new Date(),
            }
          : u
      )
    );
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
            className="bg-white shadow rounded-lg p-4 space-y-4 max-w-md w-full"
          >
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="contrasena"
                className="block text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            <div>
              <label
                htmlFor="rol"
                className="block text-sm font-medium text-slate-700"
              >
                Rol
              </label>
              <select
                id="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {rolesDisponibles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
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
          <div className="w-full md:w-64 relative">
            <label
              htmlFor="buscar"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Buscar usuario
            </label>
            <div className="relative text-slate-400 focus-within:text-indigo-500">
              <input
                id="buscar"
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar correo o rol..."
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
            <p className="text-sm text-slate-500">No hay usuarios que coincidan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-slate-600">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Fecha registro</th>
                    <th className="px-4 py-3">Fecha modificación</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsuarios.map((u, index) => (
                    <tr
                      key={u.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50 hover:bg-slate-100"}
                    >
                      <td className="px-4 py-2">{u.id}</td>
                      <td className="px-4 py-2">{u.correo}</td>
                      <td className="px-4 py-2">{u.rol}</td>
                      <td className="px-4 py-2">
                        {u.fechaRegistro.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {u.fechaModificacion ? u.fechaModificacion.toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            title="Editar"
                            onClick={() => handleEdit(u.id)}
                            className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full transition cursor-pointer"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => handleDelete(u.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full transition cursor-pointer"
                          >
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
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
