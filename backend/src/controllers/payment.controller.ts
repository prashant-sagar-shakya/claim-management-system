import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import mongoose from "mongoose";

export class PaymentController {
  static async handleGetUserPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res
          .status(401)
          .json({ message: "Authentication required to fetch user payments." });
        return;
      }
      const userId = req.user.id;
      const payments = await PaymentService.getPaymentsByUserId(userId);
      res
        .status(200)
        .json(
          payments.map((p) => p.toObject({ virtuals: true, getters: true }))
        );
    } catch (error: any) {
      console.error(
        "Error in PaymentController.handleGetUserPayments:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching user payments.",
        });
    }
  }

  static async handleGetAllPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // For Admin
    try {
      if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required." });
        return;
      }
      const payments = await PaymentService.getAllPayments();
      res
        .status(200)
        .json(
          payments.map((p) => p.toObject({ virtuals: true, getters: true }))
        );
    } catch (error: any) {
      console.error(
        "Error in PaymentController.handleGetAllPayments:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching all payments.",
        });
    }
  }

  // Add handleMakePayment controller later if needed
}
