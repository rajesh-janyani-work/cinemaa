import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_EXPIRES: string;
  REFRESH_TOKEN_EXPIRES: string;
  COOKIE_DOMAIN: string;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
};

export const env: EnvConfig = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: parseInt(getEnv("PORT", "4000"), 10),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRES: getEnv("ACCESS_TOKEN_EXPIRES", "15m"),
  REFRESH_TOKEN_EXPIRES: getEnv("REFRESH_TOKEN_EXPIRES", "7d"),
  COOKIE_DOMAIN: getEnv("COOKIE_DOMAIN", "localhost"),
};
