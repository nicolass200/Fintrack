import { prisma } from "../../config/prisma";
export const dashboardRepository = {
    async findTransactionsByUser({ userId, startDate, endDate, }) {
        return prisma.transaction.findMany({
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
