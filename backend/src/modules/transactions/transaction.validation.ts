import { z } from "zod";

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"], {
  message: "O tipo da transacao deve ser INCOME ou EXPENSE",
});

const optionalTextSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().max(80, "O campo deve ter no maximo 80 caracteres").optional()
);

const optionalBooleanQuerySchema = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    return value === "true";
  });

export const createTransactionSchema = z.object({
  body: z.object({
    description: z
      .string({
        message: "A descricao e obrigatoria",
      })
      .trim()
      .min(1, "A descricao e obrigatoria")
      .max(100, "A descricao deve ter no maximo 100 caracteres"),

    amount: z
      .number({
        message: "O valor e obrigatorio",
      })
      .positive("O valor deve ser maior que zero"),

    type: transactionTypeSchema,

    date: z
      .string({
        message: "A data e obrigatoria",
      })
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Data invalida",
      }),

    categoryId: z
      .string({
        message: "A categoria e obrigatoria",
      })
      .uuid("Categoria invalida"),

    paymentMethod: optionalTextSchema,

    account: optionalTextSchema,

    isSettled: z.boolean().optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da transacao invalido"),
  }),

  body: z.object({
    description: z
      .string()
      .trim()
      .min(1, "A descricao e obrigatoria")
      .max(100, "A descricao deve ter no maximo 100 caracteres")
      .optional(),

    amount: z.number().positive("O valor deve ser maior que zero").optional(),

    type: transactionTypeSchema.optional(),

    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Data invalida",
      })
      .optional(),

    categoryId: z.string().uuid("Categoria invalida").optional(),

    paymentMethod: optionalTextSchema,

    account: optionalTextSchema,

    isSettled: z.boolean().optional(),
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da transacao invalido"),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da transacao invalido"),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    month: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : undefined))
      .refine((value) => value === undefined || (value >= 1 && value <= 12), {
        message: "O mes deve estar entre 1 e 12",
      }),

    year: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : undefined))
      .refine((value) => value === undefined || value >= 2000, {
        message: "Ano invalido",
      }),

    type: transactionTypeSchema.optional(),

    categoryId: z.string().uuid("Categoria invalida").optional(),

    isSettled: optionalBooleanQuerySchema,

    paymentMethod: optionalTextSchema,
  }),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>["body"];

export type UpdateTransactionInput = z.infer<
  typeof updateTransactionSchema
>["body"];

export type ListTransactionsQuery = z.infer<
  typeof listTransactionsSchema
>["query"];
