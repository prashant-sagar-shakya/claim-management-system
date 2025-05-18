import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/user.model";
import { Types } from "mongoose";
import crypto from "crypto";

const JWT_SECRET ="insurance_management_jwt_secret_for_backend_only_change_this";
const JWT_EXPIRES_IN = "7d";
const PASSWORD_RESET_TOKEN_DURATION_MINUTES = 10;

export class AuthService {
  private static sanitizeUser(
    userDoc: IUser
  ): Omit<
    IUser,
    | "password"
    | "comparePassword"
    | "_id"
    | "passwordResetToken"
    | "passwordResetExpires"
  > & { id: string } {
    const userObject = userDoc.toObject
      ? userDoc.toObject({ virtuals: true, getters: true })
      : { ...userDoc };
    const {
      password,
      _id,
      __v,
      passwordResetToken,
      passwordResetExpires,
      ...restOfUser
    } = userObject;
    const idString =
      _id instanceof Types.ObjectId ? _id.toString() : String(_id);
    return {
      id: idString,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      role: userDoc.role,
      phone: userDoc.phone,
      address: userDoc.address,
      profileImageUrl: userDoc.profileImageUrl,
      themePreference: userDoc.themePreference,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    } as Omit<
      IUser,
      | "password"
      | "comparePassword"
      | "_id"
      | "passwordResetToken"
      | "passwordResetExpires"
    > & { id: string };
  }

  static async registerUser(
    userData: Pick<
      IUser,
      "firstName" | "lastName" | "email" | "password" | "role"
    >
  ) {
    try {
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      const user = new UserModel({ ...userData });
      await user.save();
      const registeredUserDoc = await UserModel.findById(user._id).select(
        "-__v -passwordResetToken -passwordResetExpires"
      );
      if (!registeredUserDoc) {
        throw new Error("User registration failed: User not found after save.");
      }
      const token = this.generateToken(registeredUserDoc);
      return { token, user: this.sanitizeUser(registeredUserDoc) };
    } catch (error: any) {
      console.error(
        "AuthService.registerUser Error:",
        error.message,
        error.stack
      );
      throw error;
    }
  }

  static async loginUser(email: string, passwordInput: string) {
    try {
      const userWithPassword = await UserModel.findOne({ email }).select(
        "+password -__v -passwordResetToken -passwordResetExpires"
      );
      if (!userWithPassword) {
        throw new Error("Invalid email or password");
      }
      const isPasswordValid = await userWithPassword.comparePassword(
        passwordInput
      );
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
      const token = this.generateToken(userWithPassword);
      return { token, user: this.sanitizeUser(userWithPassword) };
    } catch (error: any) {
      console.error("AuthService.loginUser Error:", error.message, error.stack);
      throw error;
    }
  }

  static async getUserById(userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format.");
      }
      const user = await UserModel.findById(userId).select(
        "-__v -passwordResetToken -passwordResetExpires"
      );
      if (!user) {
        throw new Error("User not found");
      }
      return this.sanitizeUser(user);
    } catch (error: any) {
      console.error(
        `AuthService.getUserById Error for ID ${userId}:`,
        error.message,
        error.stack
      );
      throw error;
    }
  }

  static async getAllUsers(): Promise<
    (Omit<
      IUser,
      | "password"
      | "comparePassword"
      | "_id"
      | "passwordResetToken"
      | "passwordResetExpires"
    > & { id: string })[]
  > {
    try {
      const users = await UserModel.find()
        .select("-__v -passwordResetToken -passwordResetExpires")
        .sort({ createdAt: -1 });
      return users.map((user) => this.sanitizeUser(user));
    } catch (error: any) {
      console.error(
        "AuthService.getAllUsers Error:",
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to fetch all users.");
    }
  }

  static async updateUserProfile(
    userId: string,
    updateData: Partial<
      Pick<
        IUser,
        | "firstName"
        | "lastName"
        | "phone"
        | "address"
        | "profileImageUrl"
        | "themePreference"
        | "role"
      >
    >
  ) {
    try {
      const allowedUpdates: (keyof typeof updateData)[] = [
        "firstName",
        "lastName",
        "phone",
        "address",
        "profileImageUrl",
        "themePreference",
      ];
      const filteredUpdateData: Partial<typeof updateData> = {};
      for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
          (filteredUpdateData as any)[key] = updateData[key];
        }
      }
      if (updateData.role && Object.keys(updateData).includes("role")) {
        (filteredUpdateData as any)["role"] = updateData.role;
      }
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: filteredUpdateData },
        { new: true, runValidators: true }
      ).select("-__v -passwordResetToken -passwordResetExpires");
      if (!user) {
        throw new Error("User not found or update failed");
      }
      return this.sanitizeUser(user);
    } catch (error: any) {
      console.error(
        "AuthService.updateUserProfile Error:",
        error.message,
        error.stack
      );
      throw error;
    }
  }

  static async deleteUserById(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format.");
      }
      const result = await UserModel.findByIdAndDelete(userId);
      if (!result) {
        throw new Error("User not found for deletion.");
      }
      return { success: true, message: "User deleted successfully." };
    } catch (error: any) {
      console.error(
        `AuthService.deleteUserById Error for ID ${userId}:`,
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to delete user.");
    }
  }

  static async initiatePasswordReset(
    email: string
  ): Promise<{ message: string; resetTokenForTesting?: string }> {
    try {
      const user = await UserModel.findOne({ email }).select(
        "+passwordResetToken +passwordResetExpires"
      );
      if (!user) {
        console.warn(
          `AuthService.initiatePasswordReset: Attempt to reset for non-existent email: ${email}`
        );
        return {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        };
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = new Date(
        Date.now() + PASSWORD_RESET_TOKEN_DURATION_MINUTES * 60 * 1000
      );

      await user.save({ validateBeforeSave: false });

      const resetURL = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password/${resetToken}`;
      console.log("--- PASSWORD RESET LINK (FOR TESTING) ---");
      console.log(resetURL);
      console.log("-----------------------------------------");

      // Actual email sending logic would go here
      // Example: await sendEmail({ to: user.email, subject: 'Password Reset', html: `Click here to reset: <a href="${resetURL}">${resetURL}</a>` });

      return {
        message:
          "If an account with that email exists, a password reset link will be sent to your email.",
      };
    } catch (error: any) {
      console.error(
        "AuthService.initiatePasswordReset Error:",
        error.message,
        error.stack
      );
      return {
        message:
          "An error occurred while processing your request. Please try again.",
      };
    }
  }

  static async verifyPasswordResetToken(token: string): Promise<IUser | null> {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await UserModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      }).select("+password +passwordResetToken +passwordResetExpires");

      return user;
    } catch (error: any) {
      console.error(
        "AuthService.verifyPasswordResetToken Error:",
        error.message,
        error.stack
      );
      throw new Error("Failed to verify password reset token.");
    }
  }

  static async resetPasswordWithToken(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.verifyPasswordResetToken(token);
      if (!user) {
        throw new Error("Password reset token is invalid or has expired.");
      }
      if (!user.password) {
        // Ensure password field exists before assigning
        user.password = ""; // Initialize if it somehow doesn't exist
      }
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return {
        success: true,
        message: "Password has been reset successfully.",
      };
    } catch (error: any) {
      console.error(
        "AuthService.resetPasswordWithToken Error:",
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to reset password.");
    }
  }

  static generateToken(user: IUser): string {
    if (!user || !user._id) {
      throw new Error("Cannot generate token for user without an _id.");
    }
    let idString: string;
    if (user._id instanceof Types.ObjectId) {
      idString = user._id.toString();
    } else if (typeof user._id === "string") {
      idString = user._id;
    } else {
      idString = String(user._id);
    }

    return jwt.sign(
      {
        id: idString,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static verifyToken(
    token: string
  ): jwt.JwtPayload & { id: string; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (
        typeof decoded === "string" ||
        !decoded.id ||
        !decoded.email ||
        !decoded.role
      ) {
        throw new Error("Invalid token payload structure");
      }
      return decoded as jwt.JwtPayload & {
        id: string;
        email: string;
        role: string;
      };
    } catch (error: any) {
      console.error(
        "AuthService.verifyToken Error:",
        error.message,
        error.name
      );
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired.");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token signature or malformed.");
      }
      throw new Error("Token verification failed.");
    }
  }
}