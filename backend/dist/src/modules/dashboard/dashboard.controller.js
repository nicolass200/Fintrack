import { dashboardService } from "./dashboard.service";
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
export const dashboardController = {
    async summary(request, response, next) {
        try {
            const userId = getAuthenticatedUserId(request);
            const query = request.query;
            const summary = await dashboardService.getSummary({
                userId,
                month: query.month,
                year: query.year,
            });
            return response.status(200).json(summary);
        }
        catch (error) {
            next(error);
        }
    },
};
