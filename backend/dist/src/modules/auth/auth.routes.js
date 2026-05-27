"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = require("express");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const authRoutes = (0, express_1.Router)();
exports.authRoutes = authRoutes;
const authController = new auth_controller_1.AuthController();
const loginRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas. Tente novamente em alguns minutos.",
    },
});
const passwordResetRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Muitas solicitacoes de recuperacao. Tente novamente mais tarde.",
    },
});
authRoutes.post("/register", (0, validateRequest_1.validateRequest)(auth_validation_1.registerValidation), authController.register);
authRoutes.post("/login", loginRateLimit, (0, validateRequest_1.validateRequest)(auth_validation_1.loginValidation), authController.login);
authRoutes.post("/forgot-password", passwordResetRateLimit, (0, validateRequest_1.validateRequest)(auth_validation_1.forgotPasswordValidation), authController.forgotPassword);
authRoutes.post("/reset-password", passwordResetRateLimit, (0, validateRequest_1.validateRequest)(auth_validation_1.resetPasswordValidation), authController.resetPassword);
authRoutes.get("/me", authMiddleware_1.authMiddleware, authController.me);
authRoutes.post("/logout", authMiddleware_1.authMiddleware, authController.logout);
