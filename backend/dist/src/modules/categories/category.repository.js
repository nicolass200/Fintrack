"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const prisma_1 = require("../../config/prisma");
class CategoryRepository {
    async findByNameTypeAndUser(name, type, userId) {
        return prisma_1.prisma.category.findUnique({
            where: {
                name_type_userId: {
                    name,
                    type,
                    userId,
                },
            },
        });
    }
    async findByIdAndUser(id, userId) {
        return prisma_1.prisma.category.findFirst({
            where: {
                id,
                userId,
            },
        });
    }
    async create(data) {
        return prisma_1.prisma.category.create({
            data,
        });
    }
    async createMany(data) {
        return prisma_1.prisma.category.createMany({
            data,
            skipDuplicates: true,
        });
    }
    async listByUser(userId) {
        return prisma_1.prisma.category.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async update(data) {
        await prisma_1.prisma.category.updateMany({
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
    async countTransactionsByCategoryId(categoryId, userId) {
        return prisma_1.prisma.transaction.count({
            where: {
                categoryId,
                userId,
            },
        });
    }
    async delete(id, userId) {
        return prisma_1.prisma.category.deleteMany({
            where: {
                id,
                userId,
            },
        });
    }
}
exports.CategoryRepository = CategoryRepository;
