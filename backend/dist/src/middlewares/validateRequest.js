export function validateRequest(schema) {
    return (request, response, next) => {
        schema.parse({
            body: request.body,
            params: request.params,
            query: request.query,
        });
        return next();
    };
}
