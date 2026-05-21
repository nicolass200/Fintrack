import { apiClient } from "./apiClient";
import type { DashboardSummary } from "../types/dashboard";

export const dashboardService = {
  summary(token: string) {
    return apiClient<DashboardSummary>("/dashboard/summary", {
      method: "GET",
      token,
    });
  },
};