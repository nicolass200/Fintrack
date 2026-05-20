import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
export function authMiddleware(request, response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new AppError("Token não informado", 401);
    }
    const [, token] = authHeader.split(" ");
    if (!token) {
        throw new AppError("Token inválido", 401);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError("JWT_SECRET não configurado", 500);
    }
    try {
        const decoded = jwt.verify(token, secret);
        request.userId = decoded.sub;
        return next();
    }
    catch {
        throw new AppError("Token inválido ou expirado", 401);
    }
}
