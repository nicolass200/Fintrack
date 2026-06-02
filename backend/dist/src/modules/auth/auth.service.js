"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const email_service_1 = require("../../services/email.service");
const AppError_1 = require("../../utils/AppError");
const category_service_1 = require("../categories/category.service");
function generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError_1.AppError("JWT_SECRET not configured", 500);
    }
    return jsonwebtoken_1.default.sign({ sub: userId }, secret, {
        expiresIn: "7d",
    });
}
class AuthService {
    categoryService = new category_service_1.CategoryService();
    emailService = new email_service_1.EmailService();
    async register({ name, email, password }) {
        const userAlreadyExists = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (userAlreadyExists) {
            throw new AppError_1.AppError("E-mail ja cadastrado", 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        await this.categoryService.createDefaultCategoriesForUser(user.id);
        return {
            user,
            token: generateToken(user.id),
        };
    }
    async login({ email, password }) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        if (!user || !user.passwordHash) {
            throw new AppError_1.AppError("E-mail ou senha invalidos", 401);
        }
        const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new AppError_1.AppError("E-mail ou senha invalidos", 401);
        }
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            token: generateToken(user.id),
        };
    }
    async me(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new AppError_1.AppError("Usuario nao encontrado", 404);
        }
        return user;
    }
    async forgotPassword(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user) {
            return {
                message: "Se o e-mail estiver cadastrado, um codigo de recuperacao foi enviado.",
            };
        }
        if (!(0, email_service_1.isEmailDeliveryConfigured)()) {
            throw new AppError_1.AppError("Password reset email service is not configured", 500);
        }
        const token = crypto_1.default.randomBytes(16).toString("hex").toUpperCase();
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: hashedToken,
                passwordResetExpires: expires,
            },
        });
        await this.emailService.sendPasswordResetEmail(normalizedEmail, token);
        return {
            message: "Se o e-mail estiver cadastrado, um codigo de recuperacao foi enviado.",
        };
    }
    async resetPassword({ token, password }) {
        const normalizedToken = token.trim().toUpperCase();
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(normalizedToken)
            .digest("hex");
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new AppError_1.AppError("Codigo de recuperacao invalido ou expirado", 400);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        return {
            message: "Senha atualizada com sucesso.",
        };
    }
    async updateProfile({ userId, name }) {
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        return user;
    }
}
exports.AuthService = AuthService;
