import { NextFunction, Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import { DashboardSummaryQuery } from "./dashboard.validation";

type AuthenticatedRequest = Request & {
  userId?: string;
  user?: {
    id?: string;
    userId?: string;
    sub?: string;
  };
};

function getAuthenticatedUserId(request: Request) {
  const authRequest = request as AuthenticatedRequest;

  const userId =
    authRequest.userId ??
    authRequest.user?.id ??
    authRequest.user?.userId ??
    authRequest.user?.sub;

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  return userId;
}

export const dashboardController = {
  async summary(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(request);
      const query = request.query as unknown as DashboardSummaryQuery;

      const summary = await dashboardService.getSummary({
        userId,
        month: query.month,
        year: query.year,
      });

      return response.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  },
};