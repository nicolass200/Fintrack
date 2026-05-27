"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const dashboard_repository_1 = require("./dashboard.repository");
function getMonthDateRange(month, year) {
    if (!month || !year) {
        return {};
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return {
        startDate,
        endDate,
    };
}
function toNumber(value) {
    return Number(value);
}
exports.dashboardService = {
    async getSummary({ userId, month, year }) {
        const { startDate, endDate } = getMonthDateRange(month, year);
        const transactions = await dashboard_repository_1.dashboardRepository.findTransactionsByUser({
            userId,
            startDate,
            endDate,
        });
        let totalIncome = 0;
        let totalExpense = 0;
        let pendingIncome = 0;
        let pendingExpense = 0;
        const expensesByCategoryMap = new Map();
        const monthlySummaryMap = new Map();
        for (const transaction of transactions) {
            const amount = toNumber(transaction.amount);
            const transactionDate = new Date(transaction.date);
            const transactionMonth = transactionDate.getMonth() + 1;
            const transactionYear = transactionDate.getFullYear();
            const monthlyKey = `${transactionYear}-${transactionMonth}`;
            if (!monthlySummaryMap.has(monthlyKey)) {
                monthlySummaryMap.set(monthlyKey, {
                    month: transactionMonth,
                    year: transactionYear,
                    income: 0,
                    expense: 0,
                    balance: 0,
                });
            }
            const monthlySummary = monthlySummaryMap.get(monthlyKey);
            if (!monthlySummary) {
                continue;
            }
            if (transaction.type === "INCOME") {
                totalIncome += amount;
                monthlySummary.income += amount;
                if (!transaction.isSettled) {
                    pendingIncome += amount;
                }
            }
            if (transaction.type === "EXPENSE") {
                totalExpense += amount;
                monthlySummary.expense += amount;
                if (!transaction.isSettled) {
                    pendingExpense += amount;
                }
                const categoryId = transaction.category.id;
                if (!expensesByCategoryMap.has(categoryId)) {
                    expensesByCategoryMap.set(categoryId, {
                        categoryId,
                        categoryName: transaction.category.name,
                        total: 0,
                    });
                }
                const categorySummary = expensesByCategoryMap.get(categoryId);
                if (categorySummary) {
                    categorySummary.total += amount;
                }
            }
            monthlySummary.balance = monthlySummary.income - monthlySummary.expense;
        }
        const balance = totalIncome - totalExpense;
        const expensesByCategory = Array.from(expensesByCategoryMap.values()).sort((a, b) => b.total - a.total);
        const monthlySummary = Array.from(monthlySummaryMap.values()).sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            return a.month - b.month;
        });
        const latestTransactions = transactions.slice(0, 5).map((transaction) => ({
            id: transaction.id,
            description: transaction.description,
            amount: toNumber(transaction.amount),
            type: transaction.type,
            date: transaction.date,
            paymentMethod: transaction.paymentMethod,
            account: transaction.account,
            isSettled: transaction.isSettled,
            category: {
                id: transaction.category.id,
                name: transaction.category.name,
                type: transaction.category.type,
            },
        }));
        return {
            totalIncome,
            totalExpense,
            balance,
            pendingIncome,
            pendingExpense,
            expensesByCategory,
            monthlySummary,
            latestTransactions,
        };
    },
};
