// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import CategoriasIngresosPage from "../pages/CategoriasIngresosPage";
import CategoriasGastosPage from "../pages/CategoriasGastosPage";
import LoginPage from "../pages/LoginPage";
import PlanillaPage from "../pages/PlanillaPage";
import AppLayout from "../layout/AppLayout";
import UsuariosPage from "../pages/UsuariosPage";
import VerPerfilPage from "../pages/PerfilPage";
import IngresosPage from "../pages/IngresosPage";
import GastosPage from "../pages/GastosPage";
import PublicRoute from "../components/routes/public-route";
import NotFoundPage from "../pages/not-found";
import UnauthorizedPage from "../pages/unauthorized";
import ProtectedRoute from "../components/routes/protected-route";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Página de Login sin layout */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Páginas protegidas con layout */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/planilla" element={<PlanillaPage />} />
          <Route
            path="/categorias-ingresos"
            element={<CategoriasIngresosPage />}
          />
          <Route path="/ingresos" element={<IngresosPage />} />
          <Route path="/categorias-gastos" element={<CategoriasGastosPage />} />
          <Route path="/gastos" element={<GastosPage />} />
          <Route path="/perfil" element={<VerPerfilPage />} />
        </Route>
      </Route>

      {/* Páginas protegidas con layout admin */}
      <Route
        element={<ProtectedRoute perfilesPermitidos={["administrador"]} />}
      >
        <Route element={<AppLayout />}>
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>

      {/* Páginas No Autorizadas y No Encontradas */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
