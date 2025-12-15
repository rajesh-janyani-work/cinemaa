import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/user.model";
import { AppError } from "./error.middleware";

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Middleware to verify JWT access token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError(401, "User no longer exists");
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new AppError(403, "Account is locked due to too many failed login attempts");
    }

    // Attach user ID to request
    req.userId = decoded.sub;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      req.userId = decoded.sub;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
