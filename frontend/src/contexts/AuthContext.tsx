import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../api/authService";
import type { LoginData, RegisterData, User } from "../types/auth";
import { getToken, removeToken, saveToken } from "../utils/tokenStorage";
import { AuthContext } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getToken()));

  useEffect(() => {
    const storedToken = getToken();

    if (!storedToken) {
      return;
    }

    let isMounted = true;

    authService
      .me(storedToken)
      .then((authenticatedUser) => {
        if (!isMounted) {
          return;
        }

        setUser(authenticatedUser);
        setToken(storedToken);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        removeToken();
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

    saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);

    saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    removeToken();
    setUser(null);
    setToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}