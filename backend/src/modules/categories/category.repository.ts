import { TransactionType } from "@prisma/client";
import { prisma } from "../../config/prisma";

interface CreateCategoryData {
  name: string;
  type: TransactionType;
  userId: string;
}

interface UpdateCategoryData {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
}

export class CategoryRepository {
  async findByNameTypeAndUser(
    name: string,
    type: TransactionType,
    userId: string
  ) {
    return prisma.category.findUnique({
      where: {
        name_type_userId: {
          name,
          type,
          userId,
        },
      },
    });
  }

  async findByIdAndUser(id: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async create(data: CreateCategoryData) {
    return prisma.category.create({
      data,
    });
  }

  async listByUser(userId: string) {
    return prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(data: UpdateCategoryData) {
    return prisma.category.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        type: data.type,
      },
    });
  }

  async countTransactionsByCategoryId(categoryId: string, userId: string) {
    return prisma.transaction.count({
      where: {
        categoryId,
        userId,
      },
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  }
}