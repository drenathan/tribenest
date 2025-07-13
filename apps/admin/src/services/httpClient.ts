import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

httpClient.interceptors.request.use(function (config) {
  config.headers["x-timezone-offset"] = new Date().getTimezoneOffset();
  return config;
});

export const setHttpClientToken = (token: string) => {
  httpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
};

export const publicHttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const setPublicHttpClientToken = (token: string) => {
  publicHttpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
};

export default httpClient;
