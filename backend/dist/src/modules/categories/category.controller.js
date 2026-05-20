import { AppError } from "../../utils/AppError";
import { CategoryService } from "./category.service";
const categoryService = new CategoryService();
export class CategoryController {
    async create(request, response) {
        const { name, type } = request.body;
        const userId = request.userId;
        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
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
            throw new AppError("Usuário não autenticado", 401);
        }
        const categories = await categoryService.list(userId);
        return response.status(200).json(categories);
    }
    async update(request, response) {
        const userId = request.userId;
        const { name, type } = request.body;
        const categoryIdParam = request.params.id;
        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
        }
        if (!categoryIdParam || Array.isArray(categoryIdParam)) {
            throw new AppError("ID da categoria inválido", 400);
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
            throw new AppError("Usuário não autenticado", 401);
        }
        if (!categoryIdParam || Array.isArray(categoryIdParam)) {
            throw new AppError("ID da categoria inválido", 400);
        }
        const categoryId = categoryIdParam;
        await categoryService.delete({
            id: categoryId,
            userId,
        });
        return response.status(204).send();
    }
}
