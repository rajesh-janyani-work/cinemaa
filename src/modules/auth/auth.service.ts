import { User } from "../../models/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { v4 as uuid } from "uuid";
import { AppError } from "../../middlewares/error.middleware";

/**
 * Register a new user
 */
export const register = async (email: string, password: string) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  return {
    id: user._id,
    email: user.email,
    createdAt: user.createdAt,
  };
};

/**
 * Login user
 */
export const login = async (email: string, password: string) => {
  // Find user with password field
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new AppError(
      403,
      "Account is locked due to too many failed login attempts. Please try again later."
    );
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    // Increment failed login attempts
    await user.incrementLoginAttempts();
    throw new AppError(401, "Invalid credentials");
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Generate tokens
  const tokenId = uuid();
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(tokenId, user._id.toString());

  // Store refresh token (keep only last 5 tokens)
  user.refreshTokens.push({
    token: tokenId,
    createdAt: new Date(),
  });

  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
    },
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Find user with refresh tokens
  const user = await User.findById(decoded.sub).select("+refreshTokens");
  
  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new AppError(403, "Account is locked");
  }

  // Check if token exists in user's refresh tokens
  const tokenExists = user.refreshTokens.some((t) => t.token === decoded.tid);
  
  if (!tokenExists) {
    throw new AppError(401, "Invalid refresh token");
  }

  // Remove old refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t.token !== decoded.tid);

  // Generate new tokens (token rotation)
  const newTokenId = uuid();
  const newAccessToken = signAccessToken(user._id.toString());
  const newRefreshToken = signRefreshToken(newTokenId, user._id.toString());

  // Store new refresh token
  user.refreshTokens.push({
    token: newTokenId,
    createdAt: new Date(),
  });

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user by removing refresh token
 */
export const logout = async (userId: string, refreshToken: string) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(userId).select("+refreshTokens");
    
    if (!user) {
      return;
    }

    // Remove the specific refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== decoded.tid);
    await user.save();
  } catch (error) {
    // Silent fail - token might be invalid or expired
  }
};

/**
 * Logout from all devices by removing all refresh tokens
 */
export const logoutAll = async (userId: string) => {
  await User.findByIdAndUpdate(userId, {
    $set: { refreshTokens: [] },
  });
};
