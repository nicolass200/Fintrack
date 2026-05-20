import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
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
    const decoded = jwt.verify(token, secret) as TokenPayload;

    request.userId = decoded.sub;

    return next();
  } catch {
    throw new AppError("Token inválido ou expirado", 401);
  }
}