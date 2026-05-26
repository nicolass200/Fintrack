import { prisma } from "../../config/prisma";
export class CategoryRepository {
    async findByNameTypeAndUser(name, type, userId) {
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
    async findByIdAndUser(id, userId) {
        return prisma.category.findFirst({
            where: {
                id,
                userId,
            },
        });
    }
    async create(data) {
        return prisma.category.create({
            data,
        });
    }
    async createMany(data) {
        return prisma.category.createMany({
            data,
            skipDuplicates: true,
        });
    }
    async listByUser(userId) {
        return prisma.category.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async update(data) {
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
    async countTransactionsByCategoryId(categoryId, userId) {
        return prisma.transaction.count({
            where: {
                categoryId,
                userId,
            },
        });
    }
    async delete(id) {
        return prisma.category.delete({
            where: {
                id,
            },
        });
    }
}
