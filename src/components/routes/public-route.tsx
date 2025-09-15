import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Verificando sesión...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
