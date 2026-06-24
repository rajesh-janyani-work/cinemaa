import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { swaggerRouter } from "./middlewares/swagger.middleware";
import authRoutes from "./modules/auth/auth.routes";
import movieRoutes from "./modules/movie/movie.routes";
import showRoutes from "./modules/show/show.routes";


const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
// Bearer-token auth (no cookies) → credentials not required; the Authorization
// header is allowed by default. Origin is restricted to the configured client.
app.use(
  cors({
    origin: env.NODE_ENV === "production"
      ? [env.CLIENT_ORIGIN]
      : ["http://localhost:3000", "http://localhost:5173"],
  })
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
app.use("/api", apiLimiter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/shows", showRoutes);



// Swagger UI (available in development)
if (env.NODE_ENV === "development" || process.env.ENABLE_SWAGGER === "true") {
  app.use("/api-docs", swaggerRouter);
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
