"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = void 0;
const AppError_1 = require("../../utils/AppError");
const transaction_repository_1 = require("./transaction.repository");
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
function getDateRange(query) {
    if (!query.startDate && !query.endDate) {
        return getMonthDateRange(query.month, query.year);
    }
    const range = {};
    if (query.startDate) {
        range.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setUTCDate(endDate.getUTCDate() + 1);
        range.endDate = endDate;
    }
    return range;
}
async function validateCategory(categoryId, userId, type) {
    const category = await transaction_repository_1.transactionRepository.findCategoryById(categoryId, userId);
    if (!category) {
        throw new AppError_1.AppError("Categoria nao encontrada", 404);
    }
    if (type && category.type !== type) {
        throw new AppError_1.AppError("A categoria nao corresponde ao tipo da transacao", 400);
    }
    return category;
}
function normalizeOptionalText(value) {
    return value?.trim() || null;
}
exports.transactionService = {
    async create(data) {
        await validateCategory(data.categoryId, data.userId, data.type);
        return transaction_repository_1.transactionRepository.create({
            description: data.description,
            amount: data.amount,
            type: data.type,
            date: new Date(data.date),
            paymentMethod: normalizeOptionalText(data.paymentMethod),
            account: normalizeOptionalText(data.account),
            isSettled: data.isSettled,
            categoryId: data.categoryId,
            userId: data.userId,
        });
    },
    async list(userId, query) {
        const { startDate, endDate } = getDateRange(query);
        return transaction_repository_1.transactionRepository.findMany({
            userId,
            type: query.type,
            categoryId: query.categoryId,
            isSettled: query.isSettled,
            paymentMethod: normalizeOptionalText(query.paymentMethod) ?? undefined,
            startDate,
            endDate,
        });
    },
    async findById({ id, userId }) {
        const transaction = await transaction_repository_1.transactionRepository.findById(id, userId);
        if (!transaction) {
            throw new AppError_1.AppError("Transacao nao encontrada", 404);
        }
        return transaction;
    },
    async update({ id, userId, data, }) {
        const transaction = await transaction_repository_1.transactionRepository.findById(id, userId);
        if (!transaction) {
            throw new AppError_1.AppError("Transacao nao encontrada", 404);
        }
        const newType = data.type ?? transaction.type;
        const newCategoryId = data.categoryId ?? transaction.categoryId;
        if (data.categoryId || data.type) {
            await validateCategory(newCategoryId, userId, newType);
        }
        return transaction_repository_1.transactionRepository.update(id, userId, {
            description: data.description,
            amount: data.amount,
            type: data.type,
            date: data.date ? new Date(data.date) : undefined,
            paymentMethod: data.paymentMethod !== undefined
                ? normalizeOptionalText(data.paymentMethod)
                : undefined,
            account: data.account !== undefined
                ? normalizeOptionalText(data.account)
                : undefined,
            isSettled: data.isSettled,
            categoryId: data.categoryId,
        });
    },
    async delete({ id, userId }) {
        const transaction = await transaction_repository_1.transactionRepository.findById(id, userId);
        if (!transaction) {
            throw new AppError_1.AppError("Transacao nao encontrada", 404);
        }
        await transaction_repository_1.transactionRepository.delete(id, userId);
    },
};
