import { budgetService } from "./budget.service";
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
export const budgetController = {
    async create(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const budget = await budgetService.create({
                ...request.body,
                userId,
            });
            return response.status(201).json(budget);
        }
        catch (error) {
            next(error);
        }
    },
    async list(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const budgets = await budgetService.list(userId);
            return response.status(200).json(budgets);
        }
        catch (error) {
            next(error);
        }
    },
    async update(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const id = getParamId(request);
            const budget = await budgetService.update({
                id,
                userId,
                data: request.body,
            });
            return response.status(200).json(budget);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const id = getParamId(request);
            await budgetService.delete({
                id,
                userId,
            });
            return response.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    async alerts(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const month = request.query.month
                ? Number(request.query.month)
                : undefined;
            const year = request.query.year
                ? Number(request.query.year)
                : undefined;
            const alerts = await budgetService.getAlerts(userId, {
                month,
                year,
            });
            return response.status(200).json(alerts);
        }
        catch (error) {
            next(error);
        }
    },
};
