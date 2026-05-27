"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./modules/auth/auth.routes");
const category_routes_1 = require("./modules/categories/category.routes");
const transaction_routes_1 = require("./modules/transactions/transaction.routes");
const dashboard_routes_1 = require("./modules/dashboard/dashboard.routes");
const budget_routes_1 = require("./modules/budgets/budget.routes");
const routes = (0, express_1.Router)();
exports.routes = routes;
routes.get("/health", (request, response) => {
    return response.status(200).json({
        status: "ok",
        message: "FinTrack API is running",
    });
});
routes.use("/auth", auth_routes_1.authRoutes);
routes.use("/categories", category_routes_1.categoryRoutes);
routes.use("/transactions", transaction_routes_1.transactionRoutes);
routes.use("/dashboard", dashboard_routes_1.dashboardRoutes);
routes.use("/budgets", budget_routes_1.budgetRoutes);
