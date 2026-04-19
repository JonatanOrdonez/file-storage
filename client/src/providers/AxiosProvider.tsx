import axios from "axios";
import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { AxiosInstance } from "axios";

const AxiosContext = createContext<AxiosInstance | null>(null);

const extractErrorMessage = (error: unknown): never => {
  const message: string =
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message ?? "Ocurrió un error inesperado";
  return Promise.reject(new Error(message)) as never;
};

export const AxiosProvider = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const instance = useMemo(() => {
    const baseURL = import.meta.env.VITE_API_URL || "";
    const inst = axios.create({ baseURL });
    inst.interceptors.response.use((response) => response, extractErrorMessage);
    return inst;
  }, []);

  return (
    <AxiosContext.Provider value={instance}>{children}</AxiosContext.Provider>
  );
};

export const useAxios = () => {
  const ctx = useContext(AxiosContext);
  if (!ctx) throw new Error("useAxios must be used within AxiosProvider");
  return ctx;
};
