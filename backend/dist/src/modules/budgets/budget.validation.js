"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetAlertsSchema = exports.deleteBudgetSchema = exports.updateBudgetSchema = exports.createBudgetSchema = void 0;
const zod_1 = require("zod");
const monthSchema = zod_1.z
    .number({
    message: "O mês é obrigatório",
})
    .int("O mês deve ser um número inteiro")
    .min(1, "O mês deve estar entre 1 e 12")
    .max(12, "O mês deve estar entre 1 e 12");
const yearSchema = zod_1.z
    .number({
    message: "O ano é obrigatório",
})
    .int("O ano deve ser um número inteiro")
    .min(2000, "Ano inválido");
const limitAmountSchema = zod_1.z
    .number({
    message: "O limite do orçamento é obrigatório",
})
    .positive("O limite do orçamento deve ser maior que zero");
exports.createBudgetSchema = zod_1.z.object({
    body: zod_1.z.object({
        month: monthSchema,
        year: yearSchema,
        limitAmount: limitAmountSchema,
    }),
});
exports.updateBudgetSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID do orçamento inválido"),
    }),
    body: zod_1.z.object({
        month: monthSchema.optional(),
        year: yearSchema.optional(),
        limitAmount: limitAmountSchema.optional(),
    }),
});
exports.deleteBudgetSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID do orçamento inválido"),
    }),
});
exports.budgetAlertsSchema = zod_1.z.object({
    query: zod_1.z.object({
        month: zod_1.z
            .string()
            .optional()
            .transform((value) => (value ? Number(value) : undefined))
            .refine((value) => value === undefined || (value >= 1 && value <= 12), {
            message: "O mês deve estar entre 1 e 12",
        }),
        year: zod_1.z
            .string()
            .optional()
            .transform((value) => (value ? Number(value) : undefined))
            .refine((value) => value === undefined || value >= 2000, {
            message: "Ano inválido",
        }),
    }),
});
