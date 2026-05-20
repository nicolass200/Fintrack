import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async register(request: Request, response: Response) {
    const { name, email, password } = request.body;

    const result = await authService.register({
      name,
      email,
      password,
    });

    return response.status(201).json(result);
  }

  async login(request: Request, response: Response) {
    const { email, password } = request.body;

    const result = await authService.login({
      email,
      password,
    });

    return response.status(200).json(result);
  }

  async me(request: AuthenticatedRequest, response: Response) {
    const userId = request.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    const user = await authService.me(userId);

    return response.status(200).json(user);
  }
}