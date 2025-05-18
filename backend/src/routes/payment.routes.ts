import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/user", authenticateToken, PaymentController.handleGetUserPayments); // For specific user
router.get("/", authenticateToken, PaymentController.handleGetAllPayments); // For admin to get all payments

// POST / for making a payment - implement controller and service for this
// router.post('/', authenticateToken, PaymentController.handleMakePayment);

export default router;
