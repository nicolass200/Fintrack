"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRepository = void 0;
const prisma_1 = require("../../config/prisma");
exports.dashboardRepository = {
    async findTransactionsByUser({ userId, startDate, endDate, }) {
        return prisma_1.prisma.transaction.findMany({
            where: {
                userId,
                ...(startDate &&
                    endDate && {
                    date: {
                        gte: startDate,
                        lt: endDate,
                    },
                }),
            },
            select: {
                id: true,
                description: true,
                amount: true,
                type: true,
                date: true,
                paymentMethod: true,
                account: true,
                isSettled: true,
                createdAt: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
    },
};
