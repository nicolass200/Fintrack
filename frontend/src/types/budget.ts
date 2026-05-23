export type Budget = {
  id: string;
  month: number;
  year: number;
  limitAmount: number | string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBudgetData = {
  month: number;
  year: number;
  limitAmount: number;
};

export type UpdateBudgetData = {
  month?: number;
  year?: number;
  limitAmount?: number;
};

export type BudgetAlertStatus = "OK" | "NEAR_LIMIT" | "EXCEEDED" | "NO_BUDGET";

export type BudgetAlert = {
  month: number;
  year: number;
  hasBudget: boolean;
  status: BudgetAlertStatus;
  message: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
};