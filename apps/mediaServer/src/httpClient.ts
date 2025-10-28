import axios from "axios";

export const apiHttpClient = axios.create({
  baseURL: process.env.API_URL || "http://127.0.0.1:8000",
});
