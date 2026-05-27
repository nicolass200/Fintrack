"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetService = void 0;
const AppError_1 = require("../../utils/AppError");
const budget_repository_1 = require("./budget.repository");
const NEAR_LIMIT_PERCENTAGE = 80;
function toNumber(value) {
    return Number(value);
}
function calculateBudgetStatus(spentAmount, limitAmount) {
    const percentageUsed = limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0;
    if (percentageUsed >= 100) {
        return {
            status: "EXCEEDED",
            percentageUsed,
        };
    }
    if (percentageUsed >= NEAR_LIMIT_PERCENTAGE) {
        return {
            status: "NEAR_LIMIT",
            percentageUsed,
        };
    }
    return {
        status: "OK",
        percentageUsed,
    };
}
exports.budgetService = {
    async create(data) {
        const existingBudget = await budget_repository_1.budgetRepository.findByMonthAndYear({
            userId: data.userId,
            month: data.month,
            year: data.year,
        });
        if (existingBudget) {
            throw new AppError_1.AppError("Ja existe orcamento cadastrado para este mes e ano", 409);
        }
        return budget_repository_1.budgetRepository.create({
            month: data.month,
            year: data.year,
            limitAmount: data.limitAmount,
            userId: data.userId,
        });
    },
    async list(userId) {
        return budget_repository_1.budgetRepository.findMany(userId);
    },
    async update({ id, userId, data, }) {
        const budget = await budget_repository_1.budgetRepository.findById(id, userId);
        if (!budget) {
            throw new AppError_1.AppError("Orcamento nao encontrado", 404);
        }
        const newMonth = data.month ?? budget.month;
        const newYear = data.year ?? budget.year;
        const existingBudget = await budget_repository_1.budgetRepository.findByMonthAndYear({
            userId,
            month: newMonth,
            year: newYear,
        });
        if (existingBudget && existingBudget.id !== id) {
            throw new AppError_1.AppError("Ja existe orcamento cadastrado para este mes e ano", 409);
        }
        return budget_repository_1.budgetRepository.update(id, userId, {
            month: data.month,
            year: data.year,
            limitAmount: data.limitAmount,
        });
    },
    async delete({ id, userId }) {
        const budget = await budget_repository_1.budgetRepository.findById(id, userId);
        if (!budget) {
            throw new AppError_1.AppError("Orcamento nao encontrado", 404);
        }
        await budget_repository_1.budgetRepository.delete(id, userId);
    },
    async getAlerts(userId, query) {
        if (!query.month || !query.year) {
            throw new AppError_1.AppError("Mes e ano sao obrigatorios para consultar alertas", 400);
        }
        const budget = await budget_repository_1.budgetRepository.findByMonthAndYear({
            userId,
            month: query.month,
            year: query.year,
        });
        if (!budget) {
            return {
                month: query.month,
                year: query.year,
                hasBudget: false,
                status: "NO_BUDGET",
                message: "Nenhum orcamento cadastrado para este mes e ano",
                limitAmount: 0,
                spentAmount: 0,
                remainingAmount: 0,
                percentageUsed: 0,
            };
        }
        const expenses = await budget_repository_1.budgetRepository.sumExpensesByMonth({
            userId,
            month: query.month,
            year: query.year,
        });
        const limitAmount = toNumber(budget.limitAmount);
        const spentAmount = toNumber(expenses._sum.amount ?? 0);
        const remainingAmount = limitAmount - spentAmount;
        const { status, percentageUsed } = calculateBudgetStatus(spentAmount, limitAmount);
        return {
            month: query.month,
            year: query.year,
            hasBudget: true,
            status,
            message: status === "EXCEEDED"
                ? "Limite de orcamento atingido ou ultrapassado"
                : status === "NEAR_LIMIT"
                    ? "Voce esta se aproximando do limite do orcamento"
                    : "Gastos dentro do limite do orcamento",
            limitAmount,
            spentAmount,
            remainingAmount,
            percentageUsed: Number(percentageUsed.toFixed(2)),
        };
    },
};
