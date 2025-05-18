import { Router } from "express";
import { ClaimController } from "../controllers/claim.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, ClaimController.handleCreateClaim);
router.get("/user", authenticateToken, ClaimController.handleGetUserClaims);
router.get("/", authenticateToken, ClaimController.handleGetAllClaims);
router.get("/:id", authenticateToken, ClaimController.handleGetClaimById);
router.put(
  "/:id/status",
  authenticateToken,
  ClaimController.handleUpdateClaimStatus
);

export default router;
