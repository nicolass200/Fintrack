"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransactionsSchema = exports.deleteTransactionSchema = exports.getTransactionByIdSchema = exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
const transactionTypeSchema = zod_1.z.enum(["INCOME", "EXPENSE"], {
    message: "O tipo da transacao deve ser INCOME ou EXPENSE",
});
const optionalTextSchema = zod_1.z.preprocess((value) => (value === null ? undefined : value), zod_1.z.string().trim().max(80, "O campo deve ter no maximo 80 caracteres").optional());
const optionalBooleanQuerySchema = zod_1.z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
    if (value === undefined) {
        return undefined;
    }
    return value === "true";
});
const optionalDateQuerySchema = zod_1.z
    .string()
    .optional()
    .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
    message: "Data invalida",
});
exports.createTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        description: zod_1.z
            .string({
            message: "A descricao e obrigatoria",
        })
            .trim()
            .min(1, "A descricao e obrigatoria")
            .max(100, "A descricao deve ter no maximo 100 caracteres"),
        amount: zod_1.z
            .number({
            message: "O valor e obrigatorio",
        })
            .positive("O valor deve ser maior que zero"),
        type: transactionTypeSchema,
        date: zod_1.z
            .string({
            message: "A data e obrigatoria",
        })
            .refine((value) => !Number.isNaN(Date.parse(value)), {
            message: "Data invalida",
        }),
        categoryId: zod_1.z
            .string({
            message: "A categoria e obrigatoria",
        })
            .uuid("Categoria invalida"),
        paymentMethod: optionalTextSchema,
        account: optionalTextSchema,
        isSettled: zod_1.z.boolean().optional(),
    }),
});
exports.updateTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID da transacao invalido"),
    }),
    body: zod_1.z.object({
        description: zod_1.z
            .string()
            .trim()
            .min(1, "A descricao e obrigatoria")
            .max(100, "A descricao deve ter no maximo 100 caracteres")
            .optional(),
        amount: zod_1.z.number().positive("O valor deve ser maior que zero").optional(),
        type: transactionTypeSchema.optional(),
        date: zod_1.z
            .string()
            .refine((value) => !Number.isNaN(Date.parse(value)), {
            message: "Data invalida",
        })
            .optional(),
        categoryId: zod_1.z.string().uuid("Categoria invalida").optional(),
        paymentMethod: optionalTextSchema,
        account: optionalTextSchema,
        isSettled: zod_1.z.boolean().optional(),
    }),
});
exports.getTransactionByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID da transacao invalido"),
    }),
});
exports.deleteTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID da transacao invalido"),
    }),
});
exports.listTransactionsSchema = zod_1.z.object({
    query: zod_1.z.object({
        month: zod_1.z
            .string()
            .optional()
            .transform((value) => (value ? Number(value) : undefined))
            .refine((value) => value === undefined || (value >= 1 && value <= 12), {
            message: "O mes deve estar entre 1 e 12",
        }),
        year: zod_1.z
            .string()
            .optional()
            .transform((value) => (value ? Number(value) : undefined))
            .refine((value) => value === undefined || value >= 2000, {
            message: "Ano invalido",
        }),
        startDate: optionalDateQuerySchema,
        endDate: optionalDateQuerySchema,
        type: transactionTypeSchema.optional(),
        categoryId: zod_1.z.string().uuid("Categoria invalida").optional(),
        isSettled: optionalBooleanQuerySchema,
        paymentMethod: optionalTextSchema,
    }),
});
