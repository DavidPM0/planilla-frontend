// src/pages/LoginPage.tsx
import { useState } from "react";
import "./LoginPage.css"; // Importamos estilos personalizados
import { useAuth, type Credentials } from "../context/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();

  const [formData, setFormData] = useState<Credentials>({
    correoElectronico: "",
    clave: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginPromise = login(formData);

    toast.promise(loginPromise, {
      loading: "Iniciando sesión...",
      success: "¡Bienvenido! Sesión iniciada correctamente",
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message ||
          "Credenciales inválidas o error de red.";
        return errorMessage;
      },
    });
  };

  return (
    <div className="login-gradient-bg min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="login-form glass-card w-full max-w-md p-8 rounded-xl shadow-xl z-10"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Iniciar sesión
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            name="correoElectronico"
            type="email"
            value={formData.correoElectronico}
            onChange={handleChange}
            className="input-field"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            name="clave"
            type="password"
            value={formData.clave}
            onChange={handleChange}
            className="input-field"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg text-sm font-medium transition text-center bg-indigo-500 text-white shadow hover:bg-indigo-600 cursor-pointer"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
