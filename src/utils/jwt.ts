import { sign, verify, SignOptions, Secret } from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Sign an access token with user ID
 */
export const signAccessToken = (userId: string): string => {
  const secret: Secret = env.JWT_ACCESS_SECRET as Secret;
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_EXPIRES as unknown as SignOptions["expiresIn"] };
  return sign({ sub: userId }, secret, options);
};

/**
 * Sign a refresh token with token ID and user ID
 */
export const signRefreshToken = (tokenId: string, userId: string): string => {
  const secret: Secret = env.JWT_REFRESH_SECRET as Secret;
  const options: SignOptions = { expiresIn: env.REFRESH_TOKEN_EXPIRES as unknown as SignOptions["expiresIn"] };
  return sign({ tid: tokenId, sub: userId }, secret, options);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): any => {
  // Let jsonwebtoken's JsonWebTokenError / TokenExpiredError propagate;
  // the global errorHandler maps them to 401 by error name.
  return verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): any => {
  // Let jsonwebtoken's JsonWebTokenError / TokenExpiredError propagate;
  // the global errorHandler maps them to 401 by error name.
  return verify(token, env.JWT_REFRESH_SECRET);
};
