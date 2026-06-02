import { apiClient } from "./apiClient";
import type {
  CreateTransactionData,
  Transaction,
  TransactionFilters,
  UpdateTransactionData,
} from "../types/transaction";

function buildTransactionQuery(filters: TransactionFilters) {
  const params = new URLSearchParams();

  if (filters.month) {
    params.append("month", filters.month);
  }

  if (filters.year) {
    params.append("year", filters.year);
  }

  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  if (filters.type) {
    params.append("type", filters.type);
  }

  if (filters.categoryId) {
    params.append("categoryId", filters.categoryId);
  }

  if (filters.isSettled) {
    params.append("isSettled", filters.isSettled);
  }

  if (filters.paymentMethod) {
    params.append("paymentMethod", filters.paymentMethod);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const transactionService = {
  list(token: string, filters: TransactionFilters = {}) {
    const query = buildTransactionQuery(filters);

    return apiClient<Transaction[]>(`/transactions${query}`, {
      method: "GET",
      token,
    });
  },

  create(token: string, data: CreateTransactionData) {
    return apiClient<Transaction>("/transactions", {
      method: "POST",
      token,
      body: data,
    });
  },

  update(token: string, id: string, data: UpdateTransactionData) {
    return apiClient<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      token,
      body: data,
    });
  },

  remove(token: string, id: string) {
    return apiClient<null>(`/transactions/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
