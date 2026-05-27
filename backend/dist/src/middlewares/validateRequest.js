"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
function validateRequest(schema) {
    return (request, response, next) => {
        const parsedRequest = schema.parse({
            body: request.body,
            params: request.params,
            query: request.query,
        });
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
