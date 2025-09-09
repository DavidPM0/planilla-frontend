import { useState, type ChangeEvent, type FormEvent } from "react";

export default function PerfilPage() {
  const [nombres, setNombres] = useState("Juan");
  const [apellidoPaterno, setApellidoPaterno] = useState("Pérez");
  const [apellidoMaterno, setApellidoMaterno] = useState("Ramírez");
  const [correo, setCorreo] = useState("juanperez@example.com");
  const [password, setPassword] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      password,
      imagen,
    });
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen px-6 py-8">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        <p className="text-slate-600 text-sm">Modifica la información de tu perfil</p>
      </div>

      {/* Formulario principal */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white shadow-sm rounded-lg p-6 space-y-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Imagen */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <img
              src={preview || "https://via.placeholder.com/120"}
              alt="Perfil"
              className="w-28 h-28 rounded-full object-cover border border-slate-300"
            />

            <label className="inline-block">
              <span className="sr-only">Seleccionar imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imagen"
              />
              <label
                htmlFor="imagen"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
              >
                Cambiar foto
              </label>
            </label>
          </div>

          {/* Campos */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombres
              </label>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition cursor-pointer"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
