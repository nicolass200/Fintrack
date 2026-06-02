import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { COOKIE_AUTH_MARKER } from "../api/apiClient";
import { authService } from "../api/authService";
import type {
  LoginData,
  RegisterData,
  UpdateProfileData,
  User,
} from "../types/auth";
import { AuthContext } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authService
      .me()
      .then((authenticatedUser) => {
        if (!isMounted) {
          return;
        }

        setUser(authenticatedUser);
        setToken(COOKIE_AUTH_MARKER);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setToken(null);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(data: LoginData) {
    const response = await authService.login(data);
    setUser(response.user);
    setToken(COOKIE_AUTH_MARKER);
  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);
    setUser(response.user);
    setToken(COOKIE_AUTH_MARKER);
  }

  async function updateProfile(data: UpdateProfileData) {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // A sessao local ainda deve ser encerrada se o servidor ja limpou o cookie.
    } finally {
      setUser(null);
      setToken(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
