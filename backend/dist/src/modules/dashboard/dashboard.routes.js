import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { dashboardController } from "./dashboard.controller";
import { dashboardSummarySchema } from "./dashboard.validation";
export const dashboardRoutes = Router();
dashboardRoutes.use(authMiddleware);
dashboardRoutes.get("/summary", validateRequest(dashboardSummarySchema), dashboardController.summary);
