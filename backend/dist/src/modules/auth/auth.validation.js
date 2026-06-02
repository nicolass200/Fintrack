"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const zod_1 = require("zod");
exports.registerValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: zod_1.z.string().trim().email("E-mail invalido"),
        password: zod_1.z
            .string()
            .min(10, "Senha deve ter pelo menos 10 caracteres"),
    }),
});
exports.loginValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().email("E-mail invalido"),
        password: zod_1.z
            .string()
            .min(10, "Senha deve ter pelo menos 10 caracteres"),
    }),
});
exports.forgotPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().email("E-mail invalido"),
    }),
});
exports.resetPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().trim().min(1, "Token e obrigatorio"),
        password: zod_1.z
            .string()
            .min(10, "Senha deve ter pelo menos 10 caracteres"),
    }),
});
exports.updateProfileValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Nome deve ter pelo menos 2 caracteres")
            .max(80, "Nome deve ter no maximo 80 caracteres"),
    }),
});
