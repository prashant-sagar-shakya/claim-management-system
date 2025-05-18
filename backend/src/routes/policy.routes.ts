import { Router } from "express";
import { PolicyController } from "../controllers/policy.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, PolicyController.handleCreatePolicy);
router.get("/user", authenticateToken, PolicyController.handleGetUserPolicies);
router.get("/", authenticateToken, PolicyController.handleGetAllPolicies); // For Admin
router.get("/:id", authenticateToken, PolicyController.handleGetPolicyById); // THIS IS THE ROUTE IN QUESTION

export default router;
