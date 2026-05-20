import { AppError } from "../../utils/AppError";
import { CategoryRepository } from "./category.repository";
export class CategoryService {
    categoryRepository = new CategoryRepository();
    async create({ name, type, userId }) {
        const categoryAlreadyExists = await this.categoryRepository.findByNameTypeAndUser(name, type, userId);
        if (categoryAlreadyExists) {
            throw new AppError("Categoria já existe para este tipo", 409);
        }
        return this.categoryRepository.create({
            name,
            type,
            userId,
        });
    }
    async list(userId) {
        return this.categoryRepository.listByUser(userId);
    }
    async update({ id, name, type, userId }) {
        const category = await this.categoryRepository.findByIdAndUser(id, userId);
        if (!category) {
            throw new AppError("Categoria não encontrada", 404);
        }
        const categoryAlreadyExists = await this.categoryRepository.findByNameTypeAndUser(name, type, userId);
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
    async delete({ id, userId }) {
        const category = await this.categoryRepository.findByIdAndUser(id, userId);
        if (!category) {
            throw new AppError("Categoria não encontrada", 404);
        }
        return this.categoryRepository.delete(id);
    }
}
