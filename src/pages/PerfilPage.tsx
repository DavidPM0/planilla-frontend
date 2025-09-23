import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../context/auth-context";
import useFetchApi from "../hooks/use-fetch";
import { toast } from "sonner";
import profileImage from "../assets/profile.jpg";

// Tipo para los datos que se enviarán en el PATCH
type UpdateProfileFormData = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correoElectronico: string;
};

export default function PerfilPage() {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const payload: UpdateProfileFormData = {
      nombres: formData.nombres,
      apellidoPaterno: formData.apellidoPaterno,
      correoElectronico: formData.correoElectronico,
      ...(formData.apellidoMaterno && {
        apellidoMaterno: formData.apellidoMaterno,
      }),
    };

    const updatePromise = async () => {
      try {
        await patch(`/auth/update-user/${user.id}`, payload);
        await checkUserSession();
      } finally {
        setIsSubmitting(false);
      }
    };

    toast.promise(updatePromise(), {
      loading: "Actualizando perfil...",
      success: "Perfil actualizado 🎉",
      error: (err) => {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar el perfil";
        return `Error: ${errorMessage}`;
      },
    });
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
              src={profileImage}
              alt="Perfil"
              className="w-28 h-28 rounded-full object-cover border border-slate-300"
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
