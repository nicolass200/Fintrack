import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    schema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    return next();
  };
}