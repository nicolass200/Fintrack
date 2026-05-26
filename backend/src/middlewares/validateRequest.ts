import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type ParsedRequest = {
  body?: unknown;
  params?: Request["params"];
  query?: Request["query"];
};

export function validateRequest(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const parsedRequest = schema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    }) as ParsedRequest;

    request.body = parsedRequest.body ?? request.body;
    request.params = parsedRequest.params ?? request.params;

    if (parsedRequest.query) {
      Object.defineProperty(request, "query", {
        value: parsedRequest.query,
        writable: true,
      });
    }

    return next();
  };
}
