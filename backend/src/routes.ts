import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";

const routes = Router();

routes.get("/health", (request, response) => {
  return response.status(200).json({
    status: "ok",
    message: "FinTrack API is running",
  });
});

routes.use("/auth", authRoutes);

export { routes };