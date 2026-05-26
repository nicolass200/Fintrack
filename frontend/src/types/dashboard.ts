export type ExpenseByCategory = {
  categoryId: string;
  categoryName: string;
  total: number;
};

export type MonthlySummary = {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
};

export type LatestDashboardTransaction = {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  paymentMethod: string | null;
  account: string | null;
  isSettled: boolean;
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
  };
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingIncome: number;
  pendingExpense: number;
  expensesByCategory: ExpenseByCategory[];
  monthlySummary: MonthlySummary[];
  latestTransactions: LatestDashboardTransaction[];
};
