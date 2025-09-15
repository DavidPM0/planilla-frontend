import { useCallback } from "react";

import type { AxiosRequestConfig } from "axios";
import axiosInstance from "../services/api-client";

export default function useFetchApi() {
  const get = useCallback(
    async <TResponse>(
      url: string,
      config?: AxiosRequestConfig
    ): Promise<TResponse> => {
      const res = await axiosInstance.get<TResponse>(url, config);
      return res.data;
    },
    []
  );

  const post = useCallback(
    async <TResponse, TRequest>(
      url: string,
      data: TRequest,
      config?: AxiosRequestConfig
    ): Promise<TResponse> => {
      const res = await axiosInstance.post<TResponse>(url, data, config);
      return res.data;
    },
    []
  );

  const put = useCallback(
    async <TResponse, TRequest>(
      url: string,
      data: TRequest,
      config?: AxiosRequestConfig
    ): Promise<TResponse> => {
      const res = await axiosInstance.put<TResponse>(url, data, config);
      return res.data;
    },
    []
  );

  const patch = useCallback(
    async <TResponse, TRequest>(
      url: string,
      data: TRequest,
      config?: AxiosRequestConfig
    ): Promise<TResponse> => {
      const res = await axiosInstance.patch<TResponse>(url, data, config);
      return res.data;
    },
    []
  );

  const del = useCallback(
    async <TResponse = void>( // El valor por defecto es `void` si no se espera contenido.
      url: string,
      config?: AxiosRequestConfig
    ): Promise<TResponse> => {
      const res = await axiosInstance.delete<TResponse>(url, config);
      return res.data;
    },
    []
  );

  return { get, post, put, del, patch };
}
