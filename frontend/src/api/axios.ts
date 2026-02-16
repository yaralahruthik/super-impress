import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";
import { env } from "@/env";

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
