import axios from "axios";

export const createHttpClient = (baseURL: string) => {
  const client = axios.create({ baseURL });

  client.interceptors.request.use(function (config) {
    config.headers["x-timezone-offset"] = new Date().getTimezoneOffset();
    return config;
  });

  return client;
};

console.log(process.env.API_URL);

const httpClient = axios.create({
  baseURL: process.env.API_URL || "http://localhost:8000",
});

export const setHttpClientToken = (token: string) => {
  httpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
};

export default httpClient;
