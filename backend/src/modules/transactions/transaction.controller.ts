import { NextFunction, Request, Response } from "express";
import { transactionService } from "./transaction.service";
import { ListTransactionsQuery } from "./transaction.validation";

type AuthenticatedRequest = Request & {
  userId?: string;
  user?: {
    id?: string;
    userId?: string;
    sub?: string;
  };
};

function getAuthenticatedUserId(request: Request) {
  const authRequest = request as AuthenticatedRequest;

  const userId =
    authRequest.userId ??
    authRequest.user?.id ??
    authRequest.user?.userId ??
    authRequest.user?.sub;

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  return userId;
}

function getParamId(request: Request) {
  const { id } = request.params;

  if (!id || Array.isArray(id)) {
    throw new Error("ID inválido");
  }

  return id;
}

export const transactionController = {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(request);

      const transaction = await transactionService.create({
        ...request.body,
        userId,
      });

      return response.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  },

  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(request);
      const query = request.query as unknown as ListTransactionsQuery;

      const transactions = await transactionService.list(userId, query);

      return response.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  },

  async findById(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(request);
      const id = getParamId(request);

      const transaction = await transactionService.findById({
        id,
        userId,
      });

      return response.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  },

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(request);
      const id = getParamId(request);

      const transaction = await transactionService.update({
        id,
        userId,
        data: request.body,
      });

      return response.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  },

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(request);
      const id = getParamId(request);

      await transactionService.delete({
        id,
        userId,
      });

      return response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};