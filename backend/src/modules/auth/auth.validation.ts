import { z } from "zod";

export const registerValidation = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().trim().email("E-mail invalido"),
    password: z
      .string()
      .min(10, "Senha deve ter pelo menos 10 caracteres"),
  }),
});

export const loginValidation = z.object({
  body: z.object({
    email: z.string().trim().email("E-mail invalido"),
    password: z
      .string()
      .min(10, "Senha deve ter pelo menos 10 caracteres"),
  }),
});

export const forgotPasswordValidation = z.object({
  body: z.object({
    email: z.string().trim().email("E-mail invalido"),
  }),
});

export const resetPasswordValidation = z.object({
  body: z.object({
    token: z.string().trim().min(1, "Token e obrigatorio"),
    password: z
      .string()
      .min(10, "Senha deve ter pelo menos 10 caracteres"),
  }),
});

export const updateProfileValidation = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(80, "Nome deve ter no maximo 80 caracteres"),
  }),
});
