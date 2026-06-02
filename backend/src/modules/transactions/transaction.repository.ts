import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../../config/prisma";

type CreateTransactionData = {
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  paymentMethod?: string | null;
  account?: string | null;
  isSettled?: boolean;
  categoryId: string;
  userId: string;
};

type UpdateTransactionData = {
  description?: string;
  amount?: number;
  type?: TransactionType;
  date?: Date;
  paymentMethod?: string | null;
  account?: string | null;
  isSettled?: boolean;
  categoryId?: string;
};

type FindManyFilters = {
  userId: string;
  type?: TransactionType;
  categoryId?: string;
  isSettled?: boolean;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
};

export const transactionRepository = {
  async create(data: CreateTransactionData) {
    return prisma.transaction.create({
      data,
      include: {
        category: true,
      },
    });
  },

  async findMany(filters: FindManyFilters) {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (filters.startDate) {
      dateFilter.gte = filters.startDate;
    }

    if (filters.endDate) {
      dateFilter.lt = filters.endDate;
    }

    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.isSettled !== undefined && { isSettled: filters.isSettled }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    return prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  },

  async findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });
  },

  async update(id: string, userId: string, data: UpdateTransactionData) {
    return prisma.transaction.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        category: true,
      },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.transaction.delete({
      where: {
        id,
        userId,
      },
    });
  },

  async findCategoryById(categoryId: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });
  },
};
