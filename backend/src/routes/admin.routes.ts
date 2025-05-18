import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/users", authenticateToken, AuthController.handleGetAllUsers);
router.get(
  "/users/:userId",
  authenticateToken,
  AuthController.handleGetAdminUserById
);
router.delete(
  "/users/:userId",
  authenticateToken,
  AuthController.handleDeleteUser
);

export default router;
