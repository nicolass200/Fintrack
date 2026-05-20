import { z } from "zod";
export const createCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        type: z.enum(["INCOME", "EXPENSE"], {
            message: "Tipo deve ser INCOME ou EXPENSE",
        }),
    }),
});
export const updateCategoryValidation = z.object({
    params: z.object({
        id: z.string().uuid("ID inválido"),
    }),
    body: z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        type: z.enum(["INCOME", "EXPENSE"], {
            message: "Tipo deve ser INCOME ou EXPENSE",
        }),
    }),
});
export const deleteCategoryValidation = z.object({
    params: z.object({
        id: z.string().uuid("ID inválido"),
    }),
});
