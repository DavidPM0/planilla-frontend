// src/pages/LoginPage.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginPage.css"; // Importamos estilos personalizados

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      navigate("/");
    }
  };

  return (
    <div className="login-gradient-bg min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="login-form glass-card w-full max-w-md p-8 rounded-xl shadow-xl z-10"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Iniciar sesión</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
