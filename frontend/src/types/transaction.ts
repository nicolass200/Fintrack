import type { Category, CategoryType } from "./category";

export type Transaction = {
  id: string;
  description: string;
  amount: number | string;
  type: CategoryType;
  date: string;
  paymentMethod: string | null;
  account: string | null;
  isSettled: boolean;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export type CreateTransactionData = {
  description: string;
  amount: number;
  type: CategoryType;
  date: string;
  categoryId: string;
  paymentMethod?: string | null;
  account?: string | null;
  isSettled?: boolean;
};

export type UpdateTransactionData = {
  description?: string;
  amount?: number;
  type?: CategoryType;
  date?: string;
  categoryId?: string;
  paymentMethod?: string | null;
  account?: string | null;
  isSettled?: boolean;
};

export type TransactionFilters = {
  month?: string;
  year?: string;
  type?: CategoryType | "";
  categoryId?: string;
  isSettled?: "" | "true" | "false";
  paymentMethod?: string;
};
