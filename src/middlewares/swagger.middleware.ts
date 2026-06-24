import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";

export const swaggerRouter = express.Router();

// UI
swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Optional raw JSON spec
swaggerRouter.get("/json", (_req, res) => res.json(swaggerSpec));
