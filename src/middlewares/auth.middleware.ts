import {Request, Response, NextFunction} from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/user.model";
import { AppError } from "./error.middleware";
export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    // Bearer-only: all clients send the access token in the Authorization header.
    // The token lives in client memory; no cookies are used.
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    if (!token) {
      throw new AppError(401, "Unauthorized: No token provided");
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.sub) {
      throw new AppError(401, "Unauthorized: Invalid token");
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError(401, "Unauthorized: User not found");
    }

    if(user.isLocked()) {
      throw new AppError(403, "Unauthorized: User is blocked");
    }

    req.userId = decoded.sub;
    next();
  } catch (error) {
    next(error);
  }
};


// Middleware to check if the user is an admin
export const requireAdmin = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try{
    const user = await User.findById(req.userId);
    if(!user) {
      throw new AppError(401, "Unauthorized: User not found");
    }

    if(user.role !== "ADMIN") {
      throw new AppError(403, "Forbidden: Admins only");
    }
    next();
  }
  catch(error) {
    next(error);
  }
}