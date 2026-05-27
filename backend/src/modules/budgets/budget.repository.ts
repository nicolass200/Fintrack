import { TransactionType } from "@prisma/client";
import { prisma } from "../../config/prisma";

type CreateBudgetData = {
  month: number;
  year: number;
  limitAmount: number;
  userId: string;
};

type UpdateBudgetData = {
  month?: number;
  year?: number;
  limitAmount?: number;
};

type FindBudgetByMonthAndYearInput = {
  userId: string;
  month: number;
  year: number;
};

type SumExpensesByMonthInput = {
  userId: string;
  month: number;
  year: number;
};

function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return {
    startDate,
    endDate,
  };
}

export const budgetRepository = {
  async create(data: CreateBudgetData) {
    return prisma.budget.create({
      data,
    });
  },

  async findMany(userId: string) {
    return prisma.budget.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });
  },

  async findById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });
  },

  async findByMonthAndYear({
    userId,
    month,
    year,
  }: FindBudgetByMonthAndYearInput) {
    return prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });
  },

  async update(id: string, userId: string, data: UpdateBudgetData) {
    await prisma.budget.updateMany({
      where: {
        id,
        userId,
      },
      data,
    });

    return this.findById(id, userId);
  },

  async delete(id: string, userId: string) {
    return prisma.budget.deleteMany({
      where: {
        id,
        userId,
      },
    });
  },

  async sumExpensesByMonth({ userId, month, year }: SumExpensesByMonthInput) {
    const { startDate, endDate } = getMonthDateRange(month, year);

    return prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
  },
};
