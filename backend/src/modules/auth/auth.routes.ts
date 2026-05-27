import rateLimit from "express-rate-limit";
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
} from "./auth.validation";

const authRoutes = Router();
const authController = new AuthController();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Muitas tentativas. Tente novamente em alguns minutos.",
  },
});

const passwordResetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Muitas solicitacoes de recuperacao. Tente novamente mais tarde.",
  },
});

authRoutes.post(
  "/register",
  validateRequest(registerValidation),
  authController.register
);

authRoutes.post(
  "/login",
  loginRateLimit,
  validateRequest(loginValidation),
  authController.login
);

authRoutes.post(
  "/forgot-password",
  passwordResetRateLimit,
  validateRequest(forgotPasswordValidation),
  authController.forgotPassword
);

authRoutes.post(
  "/reset-password",
  passwordResetRateLimit,
  validateRequest(resetPasswordValidation),
  authController.resetPassword
);

authRoutes.get("/me", authMiddleware, authController.me);
authRoutes.post("/logout", authMiddleware, authController.logout);

export { authRoutes };
