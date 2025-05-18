import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", AuthController.handleRegisterUser);
router.post("/login", AuthController.handleLoginUser);
router.get("/me", authenticateToken, AuthController.handleGetCurrentUser);
router.post("/forgot-password", AuthController.handleForgotPassword);
router.post("/reset-password", AuthController.handleResetPassword); // New route

export default router;
