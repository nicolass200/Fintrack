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

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesByCategory: ExpenseByCategory[];
  monthlySummary: MonthlySummary[];
};