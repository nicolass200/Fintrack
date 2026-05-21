import { createContext } from "react";
import type { LoginData, RegisterData, User } from "../types/auth";

export type AuthContextData = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextData | undefined>(undefined);