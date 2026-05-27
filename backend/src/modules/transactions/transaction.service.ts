import { TransactionType } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from "./transaction.validation";
import { transactionRepository } from "./transaction.repository";

type UserIdInput = {
  userId: string;
};

type TransactionIdInput = {
  id: string;
  userId: string;
};

function getMonthDateRange(month?: number, year?: number) {
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

async function validateCategory(
  categoryId: string,
  userId: string,
  type?: TransactionType
) {
  const category = await transactionRepository.findCategoryById(
    categoryId,
    userId
  );

  if (!category) {
    throw new AppError("Categoria nao encontrada", 404);
  }

  if (type && category.type !== type) {
    throw new AppError(
      "A categoria nao corresponde ao tipo da transacao",
      400
    );
  }

  return category;
}

function normalizeOptionalText(value?: string | null) {
  return value?.trim() || null;
}

export const transactionService = {
  async create(data: CreateTransactionInput & UserIdInput) {
    await validateCategory(data.categoryId, data.userId, data.type);

    return transactionRepository.create({
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: new Date(data.date),
      paymentMethod: normalizeOptionalText(data.paymentMethod),
      account: normalizeOptionalText(data.account),
      isSettled: data.isSettled,
      categoryId: data.categoryId,
      userId: data.userId,
    });
  },

  async list(userId: string, query: ListTransactionsQuery) {
    const { startDate, endDate } = getMonthDateRange(query.month, query.year);

    return transactionRepository.findMany({
      userId,
      type: query.type,
      categoryId: query.categoryId,
      isSettled: query.isSettled,
      paymentMethod: normalizeOptionalText(query.paymentMethod) ?? undefined,
      startDate,
      endDate,
    });
  },

  async findById({ id, userId }: TransactionIdInput) {
    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new AppError("Transacao nao encontrada", 404);
    }

    return transaction;
  },

  async update({
    id,
    userId,
    data,
  }: TransactionIdInput & { data: UpdateTransactionInput }) {
    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new AppError("Transacao nao encontrada", 404);
    }

    const newType = data.type ?? transaction.type;
    const newCategoryId = data.categoryId ?? transaction.categoryId;

    if (data.categoryId || data.type) {
      await validateCategory(newCategoryId, userId, newType);
    }

    return transactionRepository.update(id, userId, {
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: data.date ? new Date(data.date) : undefined,
      paymentMethod:
        data.paymentMethod !== undefined
          ? normalizeOptionalText(data.paymentMethod)
          : undefined,
      account:
        data.account !== undefined
          ? normalizeOptionalText(data.account)
          : undefined,
      isSettled: data.isSettled,
      categoryId: data.categoryId,
    });
  },

  async delete({ id, userId }: TransactionIdInput) {
    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new AppError("Transacao nao encontrada", 404);
    }

    await transactionRepository.delete(id, userId);
  },
};
