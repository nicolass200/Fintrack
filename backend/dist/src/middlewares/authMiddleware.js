import jwt from "jsonwebtoken";
import { AUTH_COOKIE_NAME } from "../modules/auth/auth.cookies";
import { AppError } from "../utils/AppError";
export function authMiddleware(request, response, next) {
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : null;
    const cookieToken = typeof request.cookies?.[AUTH_COOKIE_NAME] === "string"
        ? request.cookies[AUTH_COOKIE_NAME]
        : null;
    const token = bearerToken || cookieToken;
    if (!token) {
        throw new AppError("Token nao informado", 401);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError("JWT_SECRET not configured", 500);
    }
    try {
        const decoded = jwt.verify(token, secret);
        request.userId = decoded.sub;
        return next();
    }
    catch {
        throw new AppError("Token invalido ou expirado", 401);
    }
}
