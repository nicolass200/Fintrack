import {
  BudgetAlertsQuery,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "./budget.validation";
import { budgetRepository } from "./budget.repository";

type UserIdInput = {
  userId: string;
};

type BudgetIdInput = {
  id: string;
  userId: string;
};

const NEAR_LIMIT_PERCENTAGE = 80;

function toNumber(value: unknown) {
  return Number(value);
}

function calculateBudgetStatus(spentAmount: number, limitAmount: number) {
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

export const budgetService = {
  async create(data: CreateBudgetInput & UserIdInput) {
    const existingBudget = await budgetRepository.findByMonthAndYear({
      userId: data.userId,
      month: data.month,
      year: data.year,
    });

    if (existingBudget) {
      throw new Error("Já existe orçamento cadastrado para este mês e ano");
    }

    return budgetRepository.create({
      month: data.month,
      year: data.year,
      limitAmount: data.limitAmount,
      userId: data.userId,
    });
  },

  async list(userId: string) {
    return budgetRepository.findMany(userId);
  },

  async update({
    id,
    userId,
    data,
  }: BudgetIdInput & { data: UpdateBudgetInput }) {
    const budget = await budgetRepository.findById(id, userId);

    if (!budget) {
      throw new Error("Orçamento não encontrado");
    }

    const newMonth = data.month ?? budget.month;
    const newYear = data.year ?? budget.year;

    const existingBudget = await budgetRepository.findByMonthAndYear({
      userId,
      month: newMonth,
      year: newYear,
    });

    if (existingBudget && existingBudget.id !== id) {
      throw new Error("Já existe orçamento cadastrado para este mês e ano");
    }

    return budgetRepository.update(id, {
      month: data.month,
      year: data.year,
      limitAmount: data.limitAmount,
    });
  },

  async delete({ id, userId }: BudgetIdInput) {
    const budget = await budgetRepository.findById(id, userId);

    if (!budget) {
      throw new Error("Orçamento não encontrado");
    }

    await budgetRepository.delete(id);
  },

  async getAlerts(userId: string, query: BudgetAlertsQuery) {
    if (!query.month || !query.year) {
      throw new Error("Mês e ano são obrigatórios para consultar alertas");
    }

    const budget = await budgetRepository.findByMonthAndYear({
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
        message: "Nenhum orçamento cadastrado para este mês e ano",
        limitAmount: 0,
        spentAmount: 0,
        remainingAmount: 0,
        percentageUsed: 0,
      };
    }

    const expenses = await budgetRepository.sumExpensesByMonth({
      userId,
      month: query.month,
      year: query.year,
    });

    const limitAmount = toNumber(budget.limitAmount);
    const spentAmount = toNumber(expenses._sum.amount ?? 0);
    const remainingAmount = limitAmount - spentAmount;

    const { status, percentageUsed } = calculateBudgetStatus(
      spentAmount,
      limitAmount
    );

    return {
      month: query.month,
      year: query.year,
      hasBudget: true,
      status,
      message:
        status === "EXCEEDED"
          ? "Limite de orçamento atingido ou ultrapassado"
          : status === "NEAR_LIMIT"
            ? "Você está se aproximando do limite do orçamento"
            : "Gastos dentro do limite do orçamento",
      limitAmount,
      spentAmount,
      remainingAmount,
      percentageUsed: Number(percentageUsed.toFixed(2)),
    };
  },
};