// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import CategoriasIngresosPage from "../pages/CategoriasIngresosPage";
import LoginPage from "../pages/LoginPage";
import PlanillaPage from "../pages/PlanillaPage";
import AppLayout from "../layout/AppLayout";
import UsuariosPage from "../pages/UsuariosPage";
import VerPerfilPage from "../pages/PerfilPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Página de Login sin layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* Páginas protegidas con layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/categorias-ingresos" element={<CategoriasIngresosPage />} />
        <Route path="/planilla" element={<PlanillaPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/perfil" element={<VerPerfilPage />} />
      </Route>
    </Routes>
  );
}
