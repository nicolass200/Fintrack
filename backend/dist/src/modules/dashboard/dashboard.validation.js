"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardSummarySchema = void 0;
const zod_1 = require("zod");
exports.dashboardSummarySchema = zod_1.z.object({
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
