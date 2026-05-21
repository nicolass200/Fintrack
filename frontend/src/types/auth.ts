export type User = {
  id: string;
  name: string;
  email: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};