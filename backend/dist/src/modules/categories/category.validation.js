"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryValidation = exports.updateCategoryValidation = exports.createCategoryValidation = void 0;
const zod_1 = require("zod");
exports.createCategoryValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        type: zod_1.z.enum(["INCOME", "EXPENSE"], {
            message: "Tipo deve ser INCOME ou EXPENSE",
        }),
    }),
});
exports.updateCategoryValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID inválido"),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        type: zod_1.z.enum(["INCOME", "EXPENSE"], {
            message: "Tipo deve ser INCOME ou EXPENSE",
        }),
    }),
});
exports.deleteCategoryValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID inválido"),
    }),
});
