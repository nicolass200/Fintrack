import { TransactionType } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import { defaultCategories } from "./defaultCategories";
import { CategoryRepository } from "./category.repository";

interface CreateCategoryRequest {
  name: string;
  type: TransactionType;
  userId: string;
}

interface UpdateCategoryRequest {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
}

interface DeleteCategoryRequest {
  id: string;
  userId: string;
}

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  async create({ name, type, userId }: CreateCategoryRequest) {
    const normalizedName = name.trim();
    const categoryAlreadyExists =
      await this.categoryRepository.findByNameTypeAndUser(
        normalizedName,
        type,
        userId
      );

    if (categoryAlreadyExists) {
      throw new AppError("Categoria já existe para este tipo", 409);
    }

    return this.categoryRepository.create({
      name: normalizedName,
      type,
      userId,
    });
  }

  async createDefaultCategoriesForUser(userId: string) {
    return this.categoryRepository.createMany(
      defaultCategories.map((category) => ({
        ...category,
        userId,
      }))
    );
  }

  async list(userId: string) {
    await this.createDefaultCategoriesForUser(userId);

    return this.categoryRepository.listByUser(userId);
  }

  async update({ id, name, type, userId }: UpdateCategoryRequest) {
    const category = await this.categoryRepository.findByIdAndUser(id, userId);

    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    const categoryAlreadyExists =
      await this.categoryRepository.findByNameTypeAndUser(name, type, userId);

    if (categoryAlreadyExists && categoryAlreadyExists.id !== id) {
      throw new AppError("Categoria já existe para este tipo", 409);
    }

    return this.categoryRepository.update({
      id,
      name,
      type,
      userId,
    });
  }

  async delete({ id, userId }: DeleteCategoryRequest) {
    const category = await this.categoryRepository.findByIdAndUser(id, userId);

    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    const transactionsCount =
      await this.categoryRepository.countTransactionsByCategoryId(id, userId);

    if (transactionsCount > 0) {
      throw new AppError(
        "Não é possível excluir uma categoria que possui transações cadastradas",
        400
      );
    }

    return this.categoryRepository.delete(id);
  }
}
