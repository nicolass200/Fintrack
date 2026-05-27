import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AUTH_COOKIE_NAME } from "../modules/auth/auth.cookies";
import { AppError } from "../utils/AppError";

interface TokenPayload {
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const cookieToken =
    typeof request.cookies?.[AUTH_COOKIE_NAME] === "string"
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
    const decoded = jwt.verify(token, secret) as TokenPayload;
    request.userId = decoded.sub;
    return next();
  } catch {
    throw new AppError("Token invalido ou expirado", 401);
  }
}
