import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";
import path from "path";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cinemaa API",
      version: "1.0.0",
      description: "Movie ticket booking API",
    },
    servers: [
      {
        url: env.NODE_ENV === "production"
          ? env.SERVER_URL
          : `http://localhost:${env.PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
 apis: [path.resolve("src/modules/**/*.ts")],
};

export const swaggerSpec = swaggerJSDoc(options);
