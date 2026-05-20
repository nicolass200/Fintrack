import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
function generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError("JWT_SECRET não configurado", 500);
    }
    return jwt.sign({ sub: userId }, secret, {
        expiresIn: "7d",
    });
}
export class AuthService {
    async register({ name, email, password }) {
        const userAlreadyExists = await prisma.user.findUnique({
            where: { email },
        });
        if (userAlreadyExists) {
            throw new AppError("E-mail já cadastrado", 409);
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        const token = generateToken(user.id);
        return {
            user,
            token,
        };
    }
    async login({ email, password }) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.passwordHash) {
            throw new AppError("E-mail ou senha inválidos", 401);
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new AppError("E-mail ou senha inválidos", 401);
        }
        const token = generateToken(user.id);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            token,
        };
    }
    async me(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new AppError("Usuário não encontrado", 404);
        }
        return user;
    }
}
