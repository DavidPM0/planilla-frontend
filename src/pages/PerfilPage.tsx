import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../context/auth-context";
import useFetchApi from "../hooks/use-fetch";

// Tipo para los datos que se enviarán en el PATCH
type UpdateProfileFormData = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correoElectronico: string;
};

export default function PerfilPage() {
  // ✅ 1. Obtenemos user y checkUserSession del contexto
  const { user, checkUserSession } = useAuth();
  const { patch } = useFetchApi();

  // Estado local del formulario
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correoElectronico: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno || "",
        correoElectronico: user.correoElectronico,
      });
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const payload: UpdateProfileFormData = {
      nombres: formData.nombres,
      apellidoPaterno: formData.apellidoPaterno,
      correoElectronico: formData.correoElectronico,
    };
    if (formData.apellidoMaterno) {
      payload.apellidoMaterno = formData.apellidoMaterno;
    }

    try {
      await patch(`/auth/update-user/${user.id}`, payload);
      alert("¡Perfil actualizado exitosamente!");

      // ✅ 2. Llamamos a checkUserSession para sincronizar el estado global
      await checkUserSession();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar el perfil.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="p-6">Cargando perfil...</div>;
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        <p className="text-slate-600 text-sm">
          Modifica la información de tu perfil
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-white shadow-sm rounded-lg p-6 space-y-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <img
              src={preview || "https://via.placeholder.com/120"}
              alt="Perfil"
              className="w-28 h-28 rounded-full object-cover border border-slate-300"
            />
            <label
              htmlFor="imagen"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
            >
              Cambiar foto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="imagen"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombres
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido Paterno
              </label>
              <input
                type="text"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido Materno
              </label>
              <input
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="correoElectronico"
                value={formData.correoElectronico}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                required
              />
            </div>
            {/* ... (campo de contraseña comentado) ... */}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
