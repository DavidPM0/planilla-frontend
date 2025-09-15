import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

interface ProtectedRouteProps {
  perfilesPermitidos?: string[];
}

const ProtectedRoute = ({ perfilesPermitidos }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Verificando sesion</div>;

  if (!user) {
    // no añadir la pagina protegida al historial, reemplazar con la de login
    return <Navigate to="/login" replace />;
  }

  if (perfilesPermitidos && perfilesPermitidos.length > 0) {
    const tienePermiso = user.perfiles.some((perfil) =>
      perfilesPermitidos.includes(perfil)
    );
    if (!tienePermiso) {
      // El usuario está logueado pero no tiene el rol correcto.
      // Lo redirigimos a una página de "No Autorizado".
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
