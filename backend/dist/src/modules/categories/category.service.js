"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const AppError_1 = require("../../utils/AppError");
const defaultCategories_1 = require("./defaultCategories");
const category_repository_1 = require("./category.repository");
class CategoryService {
    categoryRepository = new category_repository_1.CategoryRepository();
    async create({ name, type, userId }) {
        const normalizedName = name.trim();
        const categoryAlreadyExists = await this.categoryRepository.findByNameTypeAndUser(normalizedName, type, userId);
        if (categoryAlreadyExists) {
            throw new AppError_1.AppError("Categoria já existe para este tipo", 409);
        }
        return this.categoryRepository.create({
            name: normalizedName,
            type,
            userId,
        });
    }
    async createDefaultCategoriesForUser(userId) {
        return this.categoryRepository.createMany(defaultCategories_1.defaultCategories.map((category) => ({
            ...category,
            userId,
        })));
    }
    async list(userId) {
        await this.createDefaultCategoriesForUser(userId);
        return this.categoryRepository.listByUser(userId);
    }
    async update({ id, name, type, userId }) {
        const category = await this.categoryRepository.findByIdAndUser(id, userId);
        if (!category) {
            throw new AppError_1.AppError("Categoria não encontrada", 404);
        }
        const categoryAlreadyExists = await this.categoryRepository.findByNameTypeAndUser(name, type, userId);
        if (categoryAlreadyExists && categoryAlreadyExists.id !== id) {
            throw new AppError_1.AppError("Categoria já existe para este tipo", 409);
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
            throw new AppError_1.AppError("Categoria não encontrada", 404);
        }
        const transactionsCount = await this.categoryRepository.countTransactionsByCategoryId(id, userId);
        if (transactionsCount > 0) {
            throw new AppError_1.AppError("Não é possível excluir uma categoria que possui transações cadastradas", 400);
        }
        return this.categoryRepository.delete(id, userId);
    }
}
exports.CategoryService = CategoryService;
