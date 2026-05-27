import { TransactionType } from "@prisma/client";
import { prisma } from "../../config/prisma";
function getMonthDateRange(month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return {
        startDate,
        endDate,
    };
}
export const budgetRepository = {
    async create(data) {
        return prisma.budget.create({
            data,
        });
    },
    async findMany(userId) {
        return prisma.budget.findMany({
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
        return prisma.budget.findFirst({
            where: {
                id,
                userId,
            },
        });
    },
    async findByMonthAndYear({ userId, month, year, }) {
        return prisma.budget.findUnique({
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
        await prisma.budget.updateMany({
            where: {
                id,
                userId,
            },
            data,
        });
        return this.findById(id, userId);
    },
    async delete(id, userId) {
        return prisma.budget.deleteMany({
            where: {
                id,
                userId,
            },
        });
    },
    async sumExpensesByMonth({ userId, month, year }) {
        const { startDate, endDate } = getMonthDateRange(month, year);
        return prisma.transaction.aggregate({
            where: {
                userId,
                type: TransactionType.EXPENSE,
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
