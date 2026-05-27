"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = void 0;
const transaction_service_1 = require("./transaction.service");
function getAuthenticatedUserId(request) {
    const authRequest = request;
    const userId = authRequest.userId ??
        authRequest.user?.id ??
        authRequest.user?.userId ??
        authRequest.user?.sub;
    if (!userId) {
        throw new Error("Usuário não autenticado");
    }
    return userId;
}
function getParamId(request) {
    const { id } = request.params;
    if (!id || Array.isArray(id)) {
        throw new Error("ID inválido");
    }
    return id;
}
exports.transactionController = {
    async create(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const transaction = await transaction_service_1.transactionService.create({
                ...request.body,
                userId,
            });
            return response.status(201).json(transaction);
        }
        catch (error) {
            next(error);
        }
    },
    async list(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const query = request.query;
            const transactions = await transaction_service_1.transactionService.list(userId, query);
            return response.status(200).json(transactions);
        }
        catch (error) {
            next(error);
        }
    },
    async findById(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const id = getParamId(request);
            const transaction = await transaction_service_1.transactionService.findById({
                id,
                userId,
            });
            return response.status(200).json(transaction);
        }
        catch (error) {
            next(error);
        }
    },
    async update(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const id = getParamId(request);
            const transaction = await transaction_service_1.transactionService.update({
                id,
                userId,
                data: request.body,
            });
            return response.status(200).json(transaction);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const id = getParamId(request);
            await transaction_service_1.transactionService.delete({
                id,
                userId,
            });
            return response.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
};
