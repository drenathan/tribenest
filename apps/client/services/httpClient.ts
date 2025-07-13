import axios from "axios";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

httpClient.interceptors.request.use(function (config) {
  config.headers["x-timezone-offset"] = new Date().getTimezoneOffset();
  return config;
});

export const setHttpClientToken = (token: string) => {
  httpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
};

export default httpClient;
