import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as AuthService from "./auth.service";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "./auth.schema";
import { asyncHandler } from "../../middlewares/error.middleware";


// register controller
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const user = await AuthService.register(data);
  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      user
    }
  })
});


// login controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await AuthService.login(data);

  return res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
})


// me controller
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
 
  const user = await AuthService.getMe(req.userId!);
  return res.status(200).json({
    status: "success",
    message: "User retrieved successfully",
    data: {
      user,
    },
  });
})


// refresh token controller
export const refresh = asyncHandler(async (req: Request, res: Response) =>{
  const { refreshToken } = refreshTokenSchema.parse(req.body);

  const result = await AuthService.refresh(refreshToken);

  return res.status(200).json({
    status: "success",
    message: "Token refreshed successfully",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  })
})


export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);

  await AuthService.logout(refreshToken);

  return res.status(200).json({
    status: "success",
    message: "User logged out successfully",
    data: null,
  })
})

// logout all devices controller
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);

  await AuthService.logoutAll(refreshToken);

  return res.status(200).json({
    status: "success",
    message: "Logged out from all devices",
    data: null,
  });
});



