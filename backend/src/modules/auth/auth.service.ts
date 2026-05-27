import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import {
  EmailService,
  isEmailDeliveryConfigured,
} from "../../services/email.service";
import { AppError } from "../../utils/AppError";
import { CategoryService } from "../categories/category.service";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

function generateToken(userId: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET not configured", 500);
  }

  return jwt.sign({ sub: userId }, secret, {
    expiresIn: "7d",
  });
}

export class AuthService {
  private categoryService = new CategoryService();
  private emailService = new EmailService();

  async register({ name, email, password }: RegisterRequest) {
    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      throw new AppError("E-mail ja cadastrado", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
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

  async login({ email, password }: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("E-mail ou senha invalidos", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError("E-mail ou senha invalidos", 401);
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

  async me(userId: string) {
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
      throw new AppError("Usuario nao encontrado", 404);
    }

    return user;
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        message:
          "Se o e-mail estiver cadastrado, um codigo de recuperacao foi enviado.",
      };
    }

    if (!isEmailDeliveryConfigured()) {
      throw new AppError("Password reset email service is not configured", 500);
    }

    const token = crypto.randomBytes(16).toString("hex").toUpperCase();
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    await this.emailService.sendPasswordResetEmail(normalizedEmail, token);

    return {
      message:
        "Se o e-mail estiver cadastrado, um codigo de recuperacao foi enviado.",
    };
  }

  async resetPassword({ token, password }: ResetPasswordRequest) {
    const normalizedToken = token.trim().toUpperCase();
    const hashedToken = crypto
      .createHash("sha256")
      .update(normalizedToken)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError("Codigo de recuperacao invalido ou expirado", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
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
}
