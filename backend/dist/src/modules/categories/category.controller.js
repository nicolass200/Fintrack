"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const AppError_1 = require("../../utils/AppError");
const category_service_1 = require("./category.service");
const categoryService = new category_service_1.CategoryService();
class CategoryController {
    async create(request, response) {
        const { name, type } = request.body;
        const userId = request.userId;
        if (!userId) {
            throw new AppError_1.AppError("Usuário não autenticado", 401);
        }
        const category = await categoryService.create({
            name,
            type: type,
            userId,
        });
        return response.status(201).json(category);
    }
    async list(request, response) {
        const userId = request.userId;
        if (!userId) {
            throw new AppError_1.AppError("Usuário não autenticado", 401);
        }
        const categories = await categoryService.list(userId);
        return response.status(200).json(categories);
    }
    async update(request, response) {
        const userId = request.userId;
        const { name, type } = request.body;
        const categoryIdParam = request.params.id;
        if (!userId) {
            throw new AppError_1.AppError("Usuário não autenticado", 401);
        }
        if (!categoryIdParam || Array.isArray(categoryIdParam)) {
            throw new AppError_1.AppError("ID da categoria inválido", 400);
        }
        const categoryId = categoryIdParam;
        const category = await categoryService.update({
            id: categoryId,
            name,
            type: type,
            userId,
        });
        return response.status(200).json(category);
    }
    async delete(request, response) {
        const userId = request.userId;
        const categoryIdParam = request.params.id;
        if (!userId) {
            throw new AppError_1.AppError("Usuário não autenticado", 401);
        }
        if (!categoryIdParam || Array.isArray(categoryIdParam)) {
            throw new AppError_1.AppError("ID da categoria inválido", 400);
        }
        const categoryId = categoryIdParam;
        await categoryService.delete({
            id: categoryId,
            userId,
        });
        return response.status(204).send();
    }
}
exports.CategoryController = CategoryController;
