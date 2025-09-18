import { useState, useEffect } from "react"; // 1. Importa useEffect
import type { User } from "../context/auth-context";

// --- TIPOS ---
type Perfil = {
  id: number;
  nombre: string;
};

export type UpdateUserFormData = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  perfilesIds: number[];
};

interface EditUserModalProps {
  show: boolean;
  user: User;
  perfiles: Perfil[];
  onSave: (data: UpdateUserFormData) => void;
  onCancel: () => void;
}

export default function EditUserModal({
  user,
  perfiles,
  onSave,
  onCancel,
  show,
}: EditUserModalProps) {
  // Estado interno para manejar los cambios del formulario
  const [formData, setFormData] = useState<UpdateUserFormData>({
    nombres: user.nombres,
    apellidoPaterno: user.apellidoPaterno,
    apellidoMaterno: user.apellidoMaterno || "",
    perfilesIds: [perfiles.find((p) => p.nombre === user.perfiles[0])?.id || 0],
  });

  // --- ✅ CORRECCIÓN ---
  // Este useEffect se asegura de que si el usuario a editar cambia,
  // el formulario se actualice con la nueva información.
  useEffect(() => {
    setFormData({
      nombres: user.nombres,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno || "",
      perfilesIds: [
        perfiles.find((p) => p.nombre === user.perfiles[0])?.id || 0,
      ],
    });
  }, [user, perfiles]); // Se ejecuta si 'user' o 'perfiles' cambian

  if (!show) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "perfilesIds") {
      setFormData((prev) => ({ ...prev, perfilesIds: [Number(value)] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-slate-800">Editar Usuario</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombres
          </label>
          <input
            name="nombres"
            value={formData.nombres}
            onChange={handleInputChange}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Apellido Paterno
          </label>
          <input
            name="apellidoPaterno"
            value={formData.apellidoPaterno}
            onChange={handleInputChange}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Apellido Materno
          </label>
          <input
            name="apellidoMaterno"
            value={formData.apellidoMaterno}
            onChange={handleInputChange}
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rol
          </label>
          <select
            name="perfilesIds"
            value={formData.perfilesIds[0] || ""}
            onChange={handleInputChange}
            className="input-field w-full"
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
