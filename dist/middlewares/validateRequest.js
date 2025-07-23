"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => (req, res, next) => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parseResult.error.issues,
        });
    }
    req.body = parseResult.data;
    next();
};
exports.validateRequest = validateRequest;
