"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_COOKIE_NAME = void 0;
exports.getAuthCookieOptions = getAuthCookieOptions;
exports.AUTH_COOKIE_NAME = "fintrack_session";
function getAuthCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}
