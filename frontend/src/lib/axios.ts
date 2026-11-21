import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const getBaseUrl = () => {
    if (import.meta.env.PROD) {
        console.log("Production");
        return "https://api-syncwrite.tanmayshirbhayye.tech/api/v1";
    }
    console.log("Development");
    return "http://localhost:4000/api/v1";
};

const axiosConfig = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    responseType: "json",
    withCredentials: true,
});

axiosConfig.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/user/signin") &&
            !originalRequest.url?.includes("/user/signup") &&
            !originalRequest.url?.includes("/user/refresh-access-token") &&
            !originalRequest.url?.includes("/user/logout")
        ) {
            originalRequest._retry = true;
            try {
                await axios.post(
                    `${getBaseUrl()}/user/refresh-access-token`,
                    {},
                    { withCredentials: true }
                );
                return axiosConfig(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().setUser(null);
                useAuthStore.getState().setIsAuthenticated(false);
                return Promise.reject(refreshError);
            }
        }

        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

interface ApiRequestParams extends AxiosRequestConfig {
    method: "get" | "post" | "put" | "patch" | "delete" | string;
    url: string;
    data?: any;
    params?: any;
}

export async function apiRequest<T = any>({
    method,
    url,
    data,
    params,
    ...config
}: ApiRequestParams): Promise<AxiosResponse<T>> {
    const finalConfig: AxiosRequestConfig = {
        method,
        url,
        ...(method.toLowerCase() === "get" ? { params } : { data }),
        ...config,
    };

    return axiosConfig(finalConfig);
}

export const axiosAPI = {
    get: (url: string, params?: any, config?: AxiosRequestConfig) =>
        apiRequest({ method: "get", url, params, ...config }),

    post: (url: string, data?: any, config?: AxiosRequestConfig) =>
        apiRequest({ method: "post", url, data, ...config }),

    put: (url: string, data?: any, config?: AxiosRequestConfig) =>
        apiRequest({ method: "put", url, data, ...config }),

    patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
        apiRequest({ method: "patch", url, data, ...config }),

    delete: (url: string, params?: any, config?: AxiosRequestConfig) =>
        apiRequest({ method: "delete", url, params, ...config }),
};