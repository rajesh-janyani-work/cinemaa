import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshToken {
  token: string;
  createdAt: Date;
}

export interface IUser extends Document {
  email: string;
  password: string;
  refreshTokens: IRefreshToken[];
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // 🔥 Critical: Never return password by default
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false, // Don't return refresh tokens by default
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  { 
    timestamps: true,
  }
);

// Virtual for checking if account is locked
userSchema.methods.isLocked = function (this: IUser): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function (this: IUser): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  // Otherwise, increment
  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts
  const attemptsAfterIncrement = this.loginAttempts + 1;
  if (attemptsAfterIncrement >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function (this: IUser): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Index for cleaning up old refresh tokens
userSchema.index({ "refreshTokens.createdAt": 1 });

export const User = mongoose.model<IUser>("User", userSchema);
