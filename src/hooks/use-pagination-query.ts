import { useState, useEffect, useCallback, useMemo } from "react";
import useFetchApi from "./use-fetch";

// Tipo genérico para la respuesta de paginación que coincide con el backend
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsePaginationQueryOptions {
  limit?: number;
  initialSearch?: string;
  debounceDelay?: number;
  additionalParams?: Record<string, any>;
}

export function usePaginationQuery<T>(
  endpoint: string,
  options: UsePaginationQueryOptions = {}
) {
  const {
    limit = 10,
    initialSearch = "",
    debounceDelay = 500,
    additionalParams = {},
  } = options;

  const [response, setResponse] = useState<PaginatedResponse<T>>({
    data: [],
    total: 0,
    page: 1,
    limit,
    lastPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { get } = useFetchApi();

  // Memoizar additionalParams para evitar re-creación en cada render
  const memoizedAdditionalParams = useMemo(
    () => additionalParams,
    [JSON.stringify(additionalParams)]
  );

  // Debounce para el search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset a página 1 cuando cambia la búsqueda
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [search, debounceDelay]);

  // Función para hacer fetch de los datos
  const fetchData = useCallback(
    async (page: number, searchTerm: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        // Agregar parámetros adicionales (como tipo, año, mes, etc.)
        Object.entries(memoizedAdditionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const data = await get<PaginatedResponse<T>>(
          `${endpoint}?${params.toString()}`
        );
        setResponse(data);
      } catch (err: any) {
        console.error("Error fetching paginated data:", err);
        setError(err?.response?.data?.message || "Error al cargar los datos");
        setResponse({
          data: [],
          total: 0,
          page: 1,
          limit,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, limit, get, memoizedAdditionalParams] // Usar la versión memoizada
  );

  // Efecto para cargar datos cuando cambia la página, búsqueda O parámetros adicionales
  useEffect(() => {
    fetchData(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchData]);

  // Efecto para resetear a página 1 cuando cambian los parámetros adicionales (año, mes, etc)
  useEffect(() => {
    setCurrentPage(1);
  }, [memoizedAdditionalParams]);

  // Funciones de navegación
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= response.lastPage) {
        setCurrentPage(page);
      }
    },
    [response.lastPage]
  );

  const nextPage = useCallback(() => {
    if (response.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [response.hasNextPage]);

  const previousPage = useCallback(() => {
    if (response.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [response.hasPreviousPage]);

  // Función para refrescar los datos
  const refresh = useCallback(() => {
    fetchData(currentPage, debouncedSearch);
  }, [fetchData, currentPage, debouncedSearch]);

  return {
    // Datos
    data: response.data,
    total: response.total,

    // Paginación
    currentPage: response.page,
    lastPage: response.lastPage,
    hasNextPage: response.hasNextPage,
    hasPreviousPage: response.hasPreviousPage,

    // Estados
    isLoading,
    error,

    // Búsqueda
    search,
    setSearch,

    // Acciones
    goToPage,
    nextPage,
    previousPage,
    refresh,
  };
}
