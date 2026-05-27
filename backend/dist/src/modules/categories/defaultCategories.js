"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCategories = void 0;
const client_1 = require("@prisma/client");
exports.defaultCategories = [
    { name: "Alimentacao", type: client_1.TransactionType.EXPENSE },
    { name: "Transporte", type: client_1.TransactionType.EXPENSE },
    { name: "Moradia", type: client_1.TransactionType.EXPENSE },
    { name: "Saude", type: client_1.TransactionType.EXPENSE },
    { name: "Educacao", type: client_1.TransactionType.EXPENSE },
    { name: "Lazer", type: client_1.TransactionType.EXPENSE },
    { name: "Assinaturas", type: client_1.TransactionType.EXPENSE },
    { name: "Outros gastos", type: client_1.TransactionType.EXPENSE },
    { name: "Salario", type: client_1.TransactionType.INCOME },
    { name: "Freelance", type: client_1.TransactionType.INCOME },
    { name: "Investimentos", type: client_1.TransactionType.INCOME },
    { name: "Presente", type: client_1.TransactionType.INCOME },
    { name: "Reembolso", type: client_1.TransactionType.INCOME },
    { name: "Outras receitas", type: client_1.TransactionType.INCOME },
];
