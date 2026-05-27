"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
function errorHandler(error, request, response, next) {
    if (error instanceof AppError_1.AppError) {
        return response.status(error.statusCode).json({
            message: error.message,
        });
    }
    if (error instanceof zod_1.ZodError) {
        return response.status(400).json({
            message: "Erro de validação",
            errors: error.issues,
        });
    }
    console.error(error);
    return response.status(500).json({
        message: "Erro interno do servidor",
    });
}
