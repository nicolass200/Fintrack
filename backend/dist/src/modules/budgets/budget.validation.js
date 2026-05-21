import { z } from "zod";
const monthSchema = z
    .number({
    message: "O mês é obrigatório",
})
    .int("O mês deve ser um número inteiro")
    .min(1, "O mês deve estar entre 1 e 12")
    .max(12, "O mês deve estar entre 1 e 12");
const yearSchema = z
    .number({
    message: "O ano é obrigatório",
})
    .int("O ano deve ser um número inteiro")
    .min(2000, "Ano inválido");
const limitAmountSchema = z
    .number({
    message: "O limite do orçamento é obrigatório",
})
    .positive("O limite do orçamento deve ser maior que zero");
export const createBudgetSchema = z.object({
    body: z.object({
        month: monthSchema,
        year: yearSchema,
        limitAmount: limitAmountSchema,
    }),
});
export const updateBudgetSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID do orçamento inválido"),
    }),
    body: z.object({
        month: monthSchema.optional(),
        year: yearSchema.optional(),
        limitAmount: limitAmountSchema.optional(),
    }),
});
export const deleteBudgetSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID do orçamento inválido"),
    }),
});
export const budgetAlertsSchema = z.object({
    query: z.object({
        month: z
            .string()
            .optional()
            .transform((value) => (value ? Number(value) : undefined))
            .refine((value) => value === undefined || (value >= 1 && value <= 12), {
            message: "O mês deve estar entre 1 e 12",
        }),
        year: z
            .string()
            .optional()
            .transform((value) => (value ? Number(value) : undefined))
            .refine((value) => value === undefined || value >= 2000, {
            message: "Ano inválido",
        }),
    }),
});
