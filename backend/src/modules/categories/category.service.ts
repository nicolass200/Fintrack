import { TransactionType } from "@prisma/client";
import { AppError } from "../../utils/AppError";
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
    const categoryAlreadyExists =
      await this.categoryRepository.findByNameTypeAndUser(name, type, userId);

    if (categoryAlreadyExists) {
      throw new AppError("Categoria já existe para este tipo", 409);
    }

    return this.categoryRepository.create({
      name,
      type,
      userId,
    });
  }

  async list(userId: string) {
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

    return this.categoryRepository.delete(id);
  }
}