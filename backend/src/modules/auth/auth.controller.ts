import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { AuthService } from "./auth.service";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "./auth.cookies";

const authService = new AuthService();

export class AuthController {
  async register(request: Request, response: Response) {
    const { name, email, password } = request.body;
    const result = await authService.register({
      name,
      email,
      password,
    });

    response.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions());

    return response.status(201).json({
      user: result.user,
    });
  }

  async login(request: Request, response: Response) {
    const { email, password } = request.body;
    const result = await authService.login({
      email,
      password,
    });

    response.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions());

    return response.status(200).json({
      user: result.user,
    });
  }

  async me(request: AuthenticatedRequest, response: Response) {
    const userId = request.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Usuario nao autenticado",
      });
    }

    const user = await authService.me(userId);

    return response.status(200).json(user);
  }

  async forgotPassword(request: Request, response: Response) {
    const { email } = request.body;
    const result = await authService.forgotPassword(email);

    return response.status(200).json(result);
  }

  async resetPassword(request: Request, response: Response) {
    const { token, password } = request.body;
    const result = await authService.resetPassword({
      token,
      password,
    });

    return response.status(200).json(result);
  }

  async logout(request: Request, response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
    return response.status(204).send();
  }
}
