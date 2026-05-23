import { apiClient } from "./apiClient";
import type {
  Budget,
  BudgetAlert,
  CreateBudgetData,
  UpdateBudgetData,
} from "../types/budget";

export const budgetService = {
  list(token: string) {
    return apiClient<Budget[]>("/budgets", {
      method: "GET",
      token,
    });
  },

  create(token: string, data: CreateBudgetData) {
    return apiClient<Budget>("/budgets", {
      method: "POST",
      token,
      body: data,
    });
  },

  update(token: string, id: string, data: UpdateBudgetData) {
    return apiClient<Budget>(`/budgets/${id}`, {
      method: "PUT",
      token,
      body: data,
    });
  },

  remove(token: string, id: string) {
    return apiClient<null>(`/budgets/${id}`, {
      method: "DELETE",
      token,
    });
  },

  alerts(token: string, month: number, year: number) {
    return apiClient<BudgetAlert>(
      `/budgets/alerts?month=${month}&year=${year}`,
      {
        method: "GET",
        token,
      }
    );
  },
};