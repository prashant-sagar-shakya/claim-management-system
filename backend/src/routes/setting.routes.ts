import { Router } from "express";
import { SettingController } from "../controllers/setting.controller";
import { authenticateToken } from "../middleware/auth.middleware";
// Add admin role check middleware later

const router = Router();

// Middleware to check if user is admin for all setting routes
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required." });
  }
  next();
};

router.get(
  "/",
  authenticateToken,
  isAdmin,
  SettingController.handleGetSettings
);
router.put(
  "/",
  authenticateToken,
  isAdmin,
  SettingController.handleUpdateSettings
);

export default router;
