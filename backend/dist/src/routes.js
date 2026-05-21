import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { categoryRoutes } from "./modules/categories/category.routes";
import { transactionRoutes } from "./modules/transactions/transaction.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { budgetRoutes } from "./modules/budgets/budget.routes";
const routes = Router();
routes.get("/health", (request, response) => {
    return response.status(200).json({
        status: "ok",
        message: "FinTrack API is running",
    });
});
routes.use("/auth", authRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/transactions", transactionRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/budgets", budgetRoutes);
export { routes };
