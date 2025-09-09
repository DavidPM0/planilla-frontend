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
    <div className="login-gradient-bg min-h-screen flex items-center justify-center relative">
      <form
        onSubmit={handleLogin}
        className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-sm z-10"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-md"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-md"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
