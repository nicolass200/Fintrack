import { transactionRepository } from "./transaction.repository";
function getMonthDateRange(month, year) {
    if (!month || !year) {
        return {};
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return {
        startDate,
        endDate,
    };
}
async function validateCategory(categoryId, userId, type) {
    const category = await transactionRepository.findCategoryById(categoryId, userId);
    if (!category) {
        throw new Error("Categoria não encontrada");
    }
    if (type && category.type !== type) {
        throw new Error("A categoria não corresponde ao tipo da transação");
    }
    return category;
}
export const transactionService = {
    async create(data) {
        await validateCategory(data.categoryId, data.userId, data.type);
        return transactionRepository.create({
            description: data.description,
            amount: data.amount,
            type: data.type,
            date: new Date(data.date),
            categoryId: data.categoryId,
            userId: data.userId,
        });
    },
    async list(userId, query) {
        const { startDate, endDate } = getMonthDateRange(query.month, query.year);
        return transactionRepository.findMany({
            userId,
            type: query.type,
            categoryId: query.categoryId,
            startDate,
            endDate,
        });
    },
    async findById({ id, userId }) {
        const transaction = await transactionRepository.findById(id, userId);
        if (!transaction) {
            throw new Error("Transação não encontrada");
        }
        return transaction;
    },
    async update({ id, userId, data, }) {
        const transaction = await transactionRepository.findById(id, userId);
        if (!transaction) {
            throw new Error("Transação não encontrada");
        }
        const newType = data.type ?? transaction.type;
        const newCategoryId = data.categoryId ?? transaction.categoryId;
        if (data.categoryId || data.type) {
            await validateCategory(newCategoryId, userId, newType);
        }
        return transactionRepository.update(id, userId, {
            description: data.description,
            amount: data.amount,
            type: data.type,
            date: data.date ? new Date(data.date) : undefined,
            categoryId: data.categoryId,
        });
    },
    async delete({ id, userId }) {
        const transaction = await transactionRepository.findById(id, userId);
        if (!transaction) {
            throw new Error("Transação não encontrada");
        }
        await transactionRepository.delete(id, userId);
    },
};
