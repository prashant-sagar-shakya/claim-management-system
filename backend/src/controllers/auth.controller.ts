import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import mongoose from "mongoose";

export class AuthController {
  // ... (handleRegisterUser, handleLoginUser, handleGetCurrentUser, handleGetAllUsers, handleGetAdminUserById, handleDeleteUser) ...
  // Copy all previous static methods here
  static async handleRegisterUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      if (!firstName || !lastName || !email || !password) {
        res
          .status(400)
          .json({ message: "Missing required fields for registration." });
        return;
      }
      const result = await AuthService.registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Registration Controller Error:", error.message);
      if (error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
        return;
      }
      res
        .status(500)
        .json({
          message:
            error.message ||
            "An unexpected error occurred during registration.",
        });
    }
  }
  static async handleLoginUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return;
      }
      const result = await AuthService.loginUser(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Login Controller Error:", error.message);
      if (error.message.includes("Invalid email or password")) {
        res.status(401).json({ message: error.message });
        return;
      }
      res
        .status(500)
        .json({
          message:
            error.message || "An unexpected error occurred during login.",
        });
    }
  }
  static async handleGetCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.user || !req.user.id) {
      res
        .status(401)
        .json({ message: "User not authenticated or ID missing from token." });
      return;
    }
    try {
      const user = await AuthService.getUserById(req.user.id);
      res.status(200).json(user);
    } catch (error: any) {
      console.error("Get Current User Controller Error:", error.message);
      res.status(404).json({ message: error.message || "User not found." });
    }
  }
  static async handleGetAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required." });
        return;
      }
      const users = await AuthService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error(
        "Error in AuthController.handleGetAllUsers:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching all users.",
        });
    }
  }
  static async handleGetAdminUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required." });
        return;
      }
      const userIdToFetch = req.params.userId;
      if (!userIdToFetch || !mongoose.Types.ObjectId.isValid(userIdToFetch)) {
        res.status(400).json({ message: "Invalid user ID format provided." });
        return;
      }
      const user = await AuthService.getUserById(userIdToFetch);
      res.status(200).json(user);
    } catch (error: any) {
      console.error(
        "Error in AuthController.handleGetAdminUserById:",
        error.message
      );
      if (error.message.toLowerCase().includes("user not found")) {
        res.status(404).json({ message: "User not found." });
        return;
      }
      res
        .status(500)
        .json({
          message: error.message || "Failed to fetch user details for admin.",
        });
    }
  }
  static async handleDeleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required." });
        return;
      }
      const userIdToDelete = req.params.userId;
      if (!userIdToDelete || !mongoose.Types.ObjectId.isValid(userIdToDelete)) {
        res
          .status(400)
          .json({ message: "Invalid user ID format for deletion." });
        return;
      }
      if (req.user?.id === userIdToDelete) {
        res
          .status(400)
          .json({ message: "Admin cannot delete their own account." });
        return;
      }
      const result = await AuthService.deleteUserById(userIdToDelete);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error in AuthController.handleDeleteUser:", error.message);
      if (error.message.toLowerCase().includes("user not found")) {
        res.status(404).json({ message: "User not found for deletion." });
        return;
      }
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while deleting the user.",
        });
    }
  }

  static async handleForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res
          .status(400)
          .json({ message: "Email is required for password reset." });
        return;
      }
      const result = await AuthService.initiatePasswordReset(email);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Forgot Password Controller Error:", error.message);
      res
        .status(500)
        .json({
          message:
            error.message ||
            "An error occurred processing forgot password request.",
        });
    }
  }

  static async handleResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        res
          .status(400)
          .json({ message: "Token and new password are required." });
        return;
      }
      const result = await AuthService.resetPasswordWithToken(token, password);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Reset Password Controller Error:", error.message);
      if (error.message.includes("invalid or has expired")) {
        res.status(400).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({
            message:
              error.message ||
              "An error occurred while resetting the password.",
          });
      }
    }
  }
}
