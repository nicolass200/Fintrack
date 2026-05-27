"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
function normalizeOrigin(origin) {
    try {
        return new URL(origin).origin;
    }
    catch {
        return origin.replace(/\/+$/, "");
    }
}
function getAllowedOrigins() {
    const configuredOrigins = process.env.CORS_ORIGIN?.split(",")
        .map((origin) => origin.trim())
        .map(normalizeOrigin)
        .filter(Boolean) ?? [];
    if (configuredOrigins.length > 0) {
        return configuredOrigins;
    }
    return ["http://localhost:5173", "http://localhost:5174"];
}
const allowedOrigins = new Set(getAllowedOrigins());
if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}
app.disable("x-powered-by");
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
            return callback(null, true);
        }
        return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use(express_1.default.json({ limit: "100kb" }));
app.use((0, cookie_parser_1.default)());
app.use(routes_1.routes);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
