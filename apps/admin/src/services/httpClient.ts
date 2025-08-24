import axios from "axios";

// Dynamically determine API URL based on current domain
export const getApiUrl = () => {
  // In development, use the environment variable
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || "http://localhost:8000";
  }

  // In production, use the same domain but different subdomain
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // If we're on admin subdomain, use api subdomain
  if (hostname.startsWith("admin.")) {
    return `${protocol}//api.${hostname.substring(6)}`;
  }

  return "http://localhost:8000";
};

export const getLinksUrl = () => {
  if (import.meta.env.DEV) {
    return "http://links.localhost:3001";
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//links.${hostname.substring(6)}`; // remove admin. from host name and replace with links
};

const httpClient = axios.create({
  baseURL: getApiUrl(),
});

httpClient.interceptors.request.use(function (config) {
  config.headers["x-timezone-offset"] = new Date().getTimezoneOffset();
  return config;
});

export const setHttpClientToken = (token: string) => {
  httpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
};

export const publicHttpClient = axios.create({
  baseURL: getApiUrl(),
});

export const setPublicHttpClientToken = (token: string) => {
  publicHttpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
};

export default httpClient;
