import type {
  AuthResponse,
  LoginData,
  RegisterData,
  ResetPasswordData,
  UpdateProfileData,
  User,
} from "../types/auth";
import { apiClient } from "./apiClient";

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

  me() {
    return apiClient<User>("/auth/me", {
      method: "GET",
    });
  },

  updateProfile(data: UpdateProfileData) {
    return apiClient<User>("/auth/me", {
      method: "PUT",
      body: data,
    });
  },

  logout() {
    return apiClient<null>("/auth/logout", {
      method: "POST",
    });
  },

  forgotPassword(email: string) {
    return apiClient<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword(data: ResetPasswordData) {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: data,
    });
  },
};
