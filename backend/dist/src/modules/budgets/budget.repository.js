"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../config/prisma");
function getMonthDateRange(month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return {
        startDate,
        endDate,
    };
}
exports.budgetRepository = {
    async create(data) {
        return prisma_1.prisma.budget.create({
            data,
        });
    },
    async findMany(userId) {
        return prisma_1.prisma.budget.findMany({
            where: {
                userId,
            },
            orderBy: [
                {
                    year: "desc",
                },
                {
                    month: "desc",
                },
            ],
        });
    },
    async findById(id, userId) {
        return prisma_1.prisma.budget.findFirst({
            where: {
                id,
                userId,
            },
        });
    },
    async findByMonthAndYear({ userId, month, year, }) {
        return prisma_1.prisma.budget.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                },
            },
        });
    },
    async update(id, userId, data) {
        await prisma_1.prisma.budget.updateMany({
            where: {
                id,
                userId,
            },
            data,
        });
        return this.findById(id, userId);
    },
    async delete(id, userId) {
        return prisma_1.prisma.budget.deleteMany({
            where: {
                id,
                userId,
            },
        });
    },
    async sumExpensesByMonth({ userId, month, year }) {
        const { startDate, endDate } = getMonthDateRange(month, year);
        return prisma_1.prisma.transaction.aggregate({
            where: {
                userId,
                type: client_1.TransactionType.EXPENSE,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        });
    },
};
