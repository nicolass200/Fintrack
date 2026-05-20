import { prisma } from "../../config/prisma";
export const transactionRepository = {
    async create(data) {
        return prisma.transaction.create({
            data,
            include: {
                category: true,
            },
        });
    },
    async findMany(filters) {
        const where = {
            userId: filters.userId,
            ...(filters.type && { type: filters.type }),
            ...(filters.categoryId && { categoryId: filters.categoryId }),
            ...(filters.startDate &&
                filters.endDate && {
                date: {
                    gte: filters.startDate,
                    lt: filters.endDate,
                },
            }),
        };
        return prisma.transaction.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: {
                date: "desc",
            },
        });
    },
    async findById(id, userId) {
        return prisma.transaction.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                category: true,
            },
        });
    },
    async update(id, userId, data) {
        return prisma.transaction.update({
            where: {
                id,
                userId,
            },
            data,
            include: {
                category: true,
            },
        });
    },
    async delete(id, userId) {
        return prisma.transaction.delete({
            where: {
                id,
                userId,
            },
        });
    },
    async findCategoryById(categoryId, userId) {
        return prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
            },
        });
    },
};
