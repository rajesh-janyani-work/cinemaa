import { CookieOptions } from "express";
import { env } from "./env";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  domain: env.COOKIE_DOMAIN,
  path: "/",
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const accessTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};
