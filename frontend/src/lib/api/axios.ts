import { auth } from '$lib/stores/auth';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('access_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

axiosInstance.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			const isLoginEndpoint = error.config?.url?.includes('/api/login');

			if (!isLoginEndpoint) {
				auth.logout();
				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}
			}
		}
		return Promise.reject(error);
	}
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	return axiosInstance(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
