"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_cookies_1 = require("./auth.cookies");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(request, response) {
        const { name, email, password } = request.body;
        const result = await authService.register({
            name,
            email,
            password,
        });
        response.cookie(auth_cookies_1.AUTH_COOKIE_NAME, result.token, (0, auth_cookies_1.getAuthCookieOptions)());
        return response.status(201).json({
            user: result.user,
        });
    }
    async login(request, response) {
        const { email, password } = request.body;
        const result = await authService.login({
            email,
            password,
        });
        response.cookie(auth_cookies_1.AUTH_COOKIE_NAME, result.token, (0, auth_cookies_1.getAuthCookieOptions)());
        return response.status(200).json({
            user: result.user,
        });
    }
    async me(request, response) {
        const userId = request.userId;
        if (!userId) {
            return response.status(401).json({
                message: "Usuario nao autenticado",
            });
        }
        const user = await authService.me(userId);
        return response.status(200).json(user);
    }
    async forgotPassword(request, response) {
        const { email } = request.body;
        const result = await authService.forgotPassword(email);
        return response.status(200).json(result);
    }
    async resetPassword(request, response) {
        const { token, password } = request.body;
        const result = await authService.resetPassword({
            token,
            password,
        });
        return response.status(200).json(result);
    }
    async logout(request, response) {
        response.clearCookie(auth_cookies_1.AUTH_COOKIE_NAME, (0, auth_cookies_1.getAuthCookieOptions)());
        return response.status(204).send();
    }
}
exports.AuthController = AuthController;
