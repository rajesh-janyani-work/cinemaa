import { User } from "../../models/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { v4 as uuid } from "uuid";
import { AppError } from "../../middlewares/error.middleware";
import { LoginInput, RegisterInput } from "./auth.schema";


// Register a new user service
export const register = async ({ username, email, password }: RegisterInput) => {
  // check BOTH unique fields, not just email
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new AppError(409, "User already exists!");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({ username, email, password: hashedPassword });

  // return a curated safe object — never the raw document (it still holds the hash)
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
};

// Login service
export const login = async ({ email, password }: LoginInput) => {

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  if (user.isLocked()) {
    throw new AppError(
      403,
      "Account is locked due to too many failed login attempts. Please try again later."
    )
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new AppError(401, "Invalid credentials");
  }

  await user.resetLoginAttempts();

  const tokenId = uuid();
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(tokenId, user._id.toString());

  user.refreshTokens.push({
    token: tokenId,
    createdAt: new Date(),
  });

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },

  };
}

// get current user profile service
export const getMe = async (userId: string) => {
   const user = await User.findById(userId);
   if(!user) {
     throw new AppError(404, "User not found");
   }
   return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
   }
}

// Refresh token service
export const refresh = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  if(!decoded || !decoded.tid || !decoded.sub) {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select("+refreshTokens");
  if(!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  const tokenExists = user.refreshTokens.some(t => t.token === decoded.tid);
  if(!tokenExists) {
    throw new AppError(401, "Invalid refresh token");
  }

  // remove the used refresh token (single-use)
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== decoded.tid);

  // generate new tokens
  const newTokenId = uuid();
  const newAccessToken = signAccessToken(user._id.toString());
  const newRefreshToken = signRefreshToken(newTokenId, user._id.toString());

  user.refreshTokens.push({
    token: newTokenId,
    createdAt: new Date(),
  });

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

// logout service
export const logout = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  if(!decoded || !decoded.tid || !decoded.sub) {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select("+refreshTokens");
  if(!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  const tokenExists = user.refreshTokens.some(t => t.token === decoded.tid);
  if(!tokenExists) {
    throw new AppError(401, "Invalid refresh token");
  }

  // remove the used refresh token (single-use)
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== decoded.tid);

  await user.save();
}


// logout from all devices service
export const logoutAll = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || !decoded.sub) {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select("+refreshTokens");
  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  user.refreshTokens = [];
  await user.save();
};

