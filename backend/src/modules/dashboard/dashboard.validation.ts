import { z } from "zod";

export const dashboardSummarySchema = z.object({
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

export type DashboardSummaryQuery = z.infer<
  typeof dashboardSummarySchema
>["query"];