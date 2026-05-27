"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_cookies_1 = require("../modules/auth/auth.cookies");
const AppError_1 = require("../utils/AppError");
function authMiddleware(request, response, next) {
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : null;
    const cookieToken = typeof request.cookies?.[auth_cookies_1.AUTH_COOKIE_NAME] === "string"
        ? request.cookies[auth_cookies_1.AUTH_COOKIE_NAME]
        : null;
    const token = bearerToken || cookieToken;
    if (!token) {
        throw new AppError_1.AppError("Token nao informado", 401);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError_1.AppError("JWT_SECRET not configured", 500);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        request.userId = decoded.sub;
        return next();
    }
    catch {
        throw new AppError_1.AppError("Token invalido ou expirado", 401);
    }
}
