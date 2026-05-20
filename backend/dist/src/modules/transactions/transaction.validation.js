import { z } from "zod";
const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"], {
    message: "O tipo da transação deve ser INCOME ou EXPENSE",
});
export const createTransactionSchema = z.object({
    body: z.object({
        description: z
            .string({
            message: "A descrição é obrigatória",
        })
            .trim()
            .min(1, "A descrição é obrigatória")
            .max(100, "A descrição deve ter no máximo 100 caracteres"),
        amount: z
            .number({
            message: "O valor é obrigatório",
        })
            .positive("O valor deve ser maior que zero"),
        type: transactionTypeSchema,
        date: z
            .string({
            message: "A data é obrigatória",
        })
            .refine((value) => !Number.isNaN(Date.parse(value)), {
            message: "Data inválida",
        }),
        categoryId: z
            .string({
            message: "A categoria é obrigatória",
        })
            .uuid("Categoria inválida"),
    }),
});
export const updateTransactionSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID da transação inválido"),
    }),
    body: z.object({
        description: z
            .string()
            .trim()
            .min(1, "A descrição é obrigatória")
            .max(100, "A descrição deve ter no máximo 100 caracteres")
            .optional(),
        amount: z.number().positive("O valor deve ser maior que zero").optional(),
        type: transactionTypeSchema.optional(),
        date: z
            .string()
            .refine((value) => !Number.isNaN(Date.parse(value)), {
            message: "Data inválida",
        })
            .optional(),
        categoryId: z.string().uuid("Categoria inválida").optional(),
    }),
});
export const getTransactionByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID da transação inválido"),
    }),
});
export const deleteTransactionSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID da transação inválido"),
    }),
});
export const listTransactionsSchema = z.object({
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
        type: transactionTypeSchema.optional(),
        categoryId: z.string().uuid("Categoria inválida").optional(),
    }),
});
