"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const swaggerUi = require("swagger-ui-express");
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "../docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
    res.send("Hello Vision!");
});
app.use("/api/auth", authRoutes_1.default);
app.use(errorMiddleware_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
exports.default = app;
