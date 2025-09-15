import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useFetchApi from "../hooks/use-fetch";

interface User {
  id: string;
  correoElectronico: string;
  estadoRegistro: boolean;
  perfiles: string[];
}

export interface Credentials {
  correoElectronico: string;
  clave: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  menu: any[];
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deberia estar dentro de AuthProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [menu, setMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { get, post } = useFetchApi();

  const checkUserSession = useCallback(async () => {
    // Si no hay token, no hay sesión activa
    if (!localStorage.getItem("token")) {
      setIsLoading(false);
      return;
    }

    try {
      const [statusResponse, menuResponse] = await Promise.all([
        get<{ user: User; token: string }>("/auth/check-status"),
        get<any[]>("/auth/menu"),
      ]);
      setUser(statusResponse.user);
      setMenu(menuResponse);
      setToken(statusResponse.token);
      localStorage.setItem("token", statusResponse.token); // Guardamos el token actualizado
    } catch (error) {
      // Si check-status falla, el interceptor redirigira al login
      setUser(null);
      setMenu([]);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = useCallback(
    async (credentials: Credentials) => {
      try {
        //Se especifican ambos tipos genéricos en el orden correcto ---
        const { user: loggedInUser, token: newToken } = await post<
          { user: User; token: string }, // TResponse: Lo que esperamos recibir
          Credentials // TRequest: Lo que estamos enviando
        >("/auth/login", credentials);

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(loggedInUser);

        const menuData = await get<any[]>("/auth/menu");
        setMenu(menuData);
      } catch (error) {
        throw error; // Relanzamos para que el componente de Login pueda manejar el fallo
      }
    },
    [post, get]
  );

  const logout = useCallback(async () => {
    setUser(null);
    setMenu([]);
    localStorage.removeItem("token");
    // window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, menu, isLoading, login, logout }}
    >
      {isLoading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
