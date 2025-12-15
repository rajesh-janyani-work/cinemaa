import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema 
} from "./auth.schema";
import { refreshTokenCookieOptions, cookieOptions } from "../../config/cookie";
import { asyncHandler } from "../../middlewares/error.middleware";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const { email, password } = registerSchema.parse(req.body);

  // Register user
  const user = await AuthService.register(email, password);

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: { user },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const { email, password } = loginSchema.parse(req.body);

  // Login user
  const { accessToken, refreshToken, user } = await AuthService.login(email, password);

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: {
      accessToken,
      user,
    },
  });
});

/**
 * Refresh access token
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Get refresh token from cookie or body
  const refreshToken = 
    req.cookies.refreshToken || 
    refreshTokenSchema.parse(req.body).refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      status: "error",
      message: "Refresh token required",
    });
  }

  // Refresh tokens
  const tokens = await AuthService.refreshAccessToken(refreshToken);

  // Set new refresh token in cookie
  res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    status: "success",
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const userId = req.userId;

  if (refreshToken && userId) {
    await AuthService.logout(userId, refreshToken);
  }

  // Clear refresh token cookie
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

/**
 * Logout from all devices
 */
export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  await AuthService.logoutAll(userId);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Logged out from all devices",
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const user = await AuthService.register; // This should use a separate service method
  // For now, return basic info
  res.status(200).json({
    status: "success",
    data: {
      userId,
    },
  });
});
