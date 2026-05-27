import { AppError } from "../../utils/AppError";
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
      throw new AppError(
        "Ja existe orcamento cadastrado para este mes e ano",
        409
      );
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
      throw new AppError("Orcamento nao encontrado", 404);
    }

    const newMonth = data.month ?? budget.month;
    const newYear = data.year ?? budget.year;

    const existingBudget = await budgetRepository.findByMonthAndYear({
      userId,
      month: newMonth,
      year: newYear,
    });

    if (existingBudget && existingBudget.id !== id) {
      throw new AppError(
        "Ja existe orcamento cadastrado para este mes e ano",
        409
      );
    }

    return budgetRepository.update(id, userId, {
      month: data.month,
      year: data.year,
      limitAmount: data.limitAmount,
    });
  },

  async delete({ id, userId }: BudgetIdInput) {
    const budget = await budgetRepository.findById(id, userId);

    if (!budget) {
      throw new AppError("Orcamento nao encontrado", 404);
    }

    await budgetRepository.delete(id, userId);
  },

  async getAlerts(userId: string, query: BudgetAlertsQuery) {
    if (!query.month || !query.year) {
      throw new AppError(
        "Mes e ano sao obrigatorios para consultar alertas",
        400
      );
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
        message: "Nenhum orcamento cadastrado para este mes e ano",
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
