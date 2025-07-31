import express from "express";
import type { Request, Response } from "express";
import errorMiddleware from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";
import fileRoutes from  "./routes/fileRoutes"

import cors from "cors";
const swaggerUi = require("swagger-ui-express");
import YAML from "yamljs";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Vision!");
});

app.use("/auth", authRoutes);
app.use("/workspace",workspaceRoutes)
app.use("/file" , fileRoutes)

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
