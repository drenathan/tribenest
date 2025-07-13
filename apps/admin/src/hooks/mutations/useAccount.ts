import httpClient from "@/services/httpClient";
import { useMutation } from "@tanstack/react-query";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      httpClient.post("/accounts/reset-password", data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      httpClient.post("/accounts/forgot-password", data),
  });
};
