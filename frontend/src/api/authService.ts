import { apiClient } from "./apiClient";
import type { AuthResponse, LoginData, RegisterData, User } from "../types/auth";

export const authService = {
  register(data: RegisterData) {
    return apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  login(data: LoginData) {
    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: data,
    });
  },

  me(token: string) {
    return apiClient<User>("/auth/me", {
      method: "GET",
      token,
    });
  },
};