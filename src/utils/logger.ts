import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize } = winston.format;

// Define a custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
  return `[${timestamp}] [${level}] ${message} ${metaString}`;
});

// Console transport – use colors in development
const consoleTransport = new winston.transports.Console({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(colorize({ all: true }), timestamp(), logFormat),
});

// File transport – only in non‑development environments
const fileTransport = new winston.transports.File({
  filename: "logs/app.log",
  level: "info",
  format: combine(timestamp(), logFormat),
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transports: env.NODE_ENV === "development" ? [consoleTransport] : [consoleTransport, fileTransport],
  exitOnError: false,
});
