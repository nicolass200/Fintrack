"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRepository = void 0;
const prisma_1 = require("../../config/prisma");
exports.transactionRepository = {
    async create(data) {
        return prisma_1.prisma.transaction.create({
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
            ...(filters.isSettled !== undefined && { isSettled: filters.isSettled }),
            ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
            ...(filters.startDate &&
                filters.endDate && {
                date: {
                    gte: filters.startDate,
                    lt: filters.endDate,
                },
            }),
        };
        return prisma_1.prisma.transaction.findMany({
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
        return prisma_1.prisma.transaction.findFirst({
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
        return prisma_1.prisma.transaction.update({
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
        return prisma_1.prisma.transaction.delete({
            where: {
                id,
                userId,
            },
        });
    },
    async findCategoryById(categoryId, userId) {
        return prisma_1.prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
            },
        });
    },
};
