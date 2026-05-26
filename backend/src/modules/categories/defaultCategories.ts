import { TransactionType } from "@prisma/client";

export const defaultCategories = [
  { name: "Alimentacao", type: TransactionType.EXPENSE },
  { name: "Transporte", type: TransactionType.EXPENSE },
  { name: "Moradia", type: TransactionType.EXPENSE },
  { name: "Saude", type: TransactionType.EXPENSE },
  { name: "Educacao", type: TransactionType.EXPENSE },
  { name: "Lazer", type: TransactionType.EXPENSE },
  { name: "Assinaturas", type: TransactionType.EXPENSE },
  { name: "Outros gastos", type: TransactionType.EXPENSE },
  { name: "Salario", type: TransactionType.INCOME },
  { name: "Freelance", type: TransactionType.INCOME },
  { name: "Investimentos", type: TransactionType.INCOME },
  { name: "Presente", type: TransactionType.INCOME },
  { name: "Reembolso", type: TransactionType.INCOME },
  { name: "Outras receitas", type: TransactionType.INCOME },
];
