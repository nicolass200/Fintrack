import { TransactionType } from "@prisma/client";
import { prisma } from "../../config/prisma";

interface CreateCategoryData {
  name: string;
  type: TransactionType;
  userId: string;
}

type CreateManyCategoryData = CreateCategoryData[];

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

  async createMany(data: CreateManyCategoryData) {
    return prisma.category.createMany({
      data,
      skipDuplicates: true,
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
    await prisma.category.updateMany({
      where: {
        id: data.id,
        userId: data.userId,
      },
      data: {
        name: data.name,
        type: data.type,
      },
    });

    return this.findByIdAndUser(data.id, data.userId);
  }

  async countTransactionsByCategoryId(categoryId: string, userId: string) {
    return prisma.transaction.count({
      where: {
        categoryId,
        userId,
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.category.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
