import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://api-url-shortener.tanmayshirbhayye.tech/api/v1/url",
    timeout: 15000,
    responseType: "json",
    withCredentials: true,
});


axiosConfig.interceptors.response.use(
    (response) => response,
    (error) => {
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
