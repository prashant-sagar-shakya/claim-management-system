import { Request, Response, NextFunction } from "express";
import { ClaimService } from "../services/claim.service";
import mongoose from "mongoose";
import { Types } from "mongoose";

export class ClaimController {
  static async handleCreateClaim(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("CLAIM_CONTROLLER: handleCreateClaim called.");
    console.log("CLAIM_CONTROLLER: Request body:", req.body);
    console.log("CLAIM_CONTROLLER: Authenticated user:", req.user);

    try {
      if (!req.user || !req.user.id) {
        console.error(
          "CLAIM_CONTROLLER: Authentication required to create a claim. User not found on req."
        );
        res
          .status(401)
          .json({ message: "Authentication required to create a claim." });
        return;
      }
      const policyholder_id = req.user.id;
      console.log(
        `CLAIM_CONTROLLER: policyholder_id set to: ${policyholder_id}`
      );

      const { policy_id, claim_amount, incident_date, description } = req.body;
      console.log(
        `CLAIM_CONTROLLER: Extracted from body - policy_id: ${policy_id}, claim_amount: ${claim_amount}, incident_date: ${incident_date}, description length: ${description?.length}`
      );

      if (
        !policy_id ||
        claim_amount == null ||
        !incident_date ||
        !description
      ) {
        console.error("CLAIM_CONTROLLER: Missing required fields.");
        res
          .status(400)
          .json({
            message:
              "Missing required fields for claim (policy_id, amount, incident_date, description).",
          });
        return;
      }

      if (!Types.ObjectId.isValid(policy_id)) {
        console.error(
          `CLAIM_CONTROLLER: Invalid Policy ID format provided: ${policy_id}`
        );
        res
          .status(400)
          .json({
            message: "Invalid Policy ID format provided for the claim.",
          });
        return;
      }

      const claimData = {
        policy_id,
        policyholder_id,
        claim_amount: Number(claim_amount),
        incident_date: new Date(incident_date),
        description,
      };
      console.log(
        "CLAIM_CONTROLLER: Prepared claimData for service:",
        claimData
      );

      const newClaim = await ClaimService.createClaim(claimData);
      console.log(
        "CLAIM_CONTROLLER: Claim created successfully by service:",
        newClaim._id
      );

      const claimObject = newClaim.toObject({ virtuals: true, getters: true });
      if (!claimObject.id && claimObject._id) {
        claimObject.id = claimObject._id.toString();
      }
      delete claimObject._id;
      delete claimObject.__v;
      res.status(201).json(claimObject);
    } catch (error: any) {
      console.error(
        "CLAIM_CONTROLLER: Error in handleCreateClaim:",
        error.message,
        error.stack
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while creating the claim.",
        });
    }
  }

  static async handleGetUserClaims(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res
          .status(401)
          .json({ message: "Authentication required to fetch user claims." });
        return;
      }
      const userId = req.user.id;
      const claims = await ClaimService.getClaimsByUserId(userId);
      res
        .status(200)
        .json(claims.map((c) => c.toObject({ virtuals: true, getters: true })));
    } catch (error: any) {
      console.error(
        "Error in ClaimController.handleGetUserClaims:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching user claims.",
        });
    }
  }

  static async handleGetAllClaims(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const claims = await ClaimService.getAllClaims();
      res
        .status(200)
        .json(claims.map((c) => c.toObject({ virtuals: true, getters: true })));
    } catch (error: any) {
      console.error(
        "Error in ClaimController.handleGetAllClaims:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching all claims.",
        });
    }
  }

  static async handleGetClaimById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const claimId = req.params.id;
      console.log(
        `CLAIM_CONTROLLER: Attempting to fetch claim with ID: ${claimId}`
      );

      if (
        !claimId ||
        claimId === "undefined" ||
        !mongoose.Types.ObjectId.isValid(claimId)
      ) {
        console.log(`CLAIM_CONTROLLER: Invalid claim ID received: ${claimId}`);
        res.status(400).json({ message: "Invalid Claim ID format." });
        return;
      }

      const claim = await ClaimService.getClaimById(claimId);

      if (!claim) {
        console.log(
          `CLAIM_CONTROLLER: Claim with ID ${claimId} not found in service.`
        );
        res.status(404).json({ message: "Claim not found." });
        return;
      }

      console.log(`CLAIM_CONTROLLER: Claim found.`);
      const claimObject = claim.toObject({ virtuals: true, getters: true });
      if (!claimObject.id && claimObject._id) {
        claimObject.id = claimObject._id.toString();
      }
      delete claimObject._id;
      delete claimObject.__v;
      res.status(200).json(claimObject);
    } catch (error: any) {
      console.error(
        "Error in ClaimController.handleGetClaimById:",
        error.message,
        error.stack
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching claim details.",
        });
    }
  }

  static async handleUpdateClaimStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log(
      `CLAIM_CONTROLLER: handleUpdateClaimStatus called for claim ID: ${req.params.id}`
    );
    console.log("CLAIM_CONTROLLER: Update status request body:", req.body);
    console.log(
      "CLAIM_CONTROLLER: Authenticated user for status update:",
      req.user
    );
    try {
      if (!req.user || !req.user.id) {
        console.error(
          "CLAIM_CONTROLLER: Authentication required for status update."
        );
        res.status(401).json({ message: "Authentication required." });
        return;
      }
      if (req.user.role !== "admin") {
        console.error(
          `CLAIM_CONTROLLER: Forbidden. User role: ${req.user.role}`
        );
        res
          .status(403)
          .json({ message: "Forbidden: Only admins can update claim status." });
        return;
      }

      const claimId = req.params.id;
      const { status, rejection_reason } = req.body;

      if (!claimId || !mongoose.Types.ObjectId.isValid(claimId)) {
        console.error(
          `CLAIM_CONTROLLER: Invalid Claim ID format for status update: ${claimId}`
        );
        res.status(400).json({ message: "Invalid Claim ID format." });
        return;
      }
      if (!status || (status !== "Approved" && status !== "Rejected")) {
        console.error(
          `CLAIM_CONTROLLER: Invalid status provided for update: ${status}`
        );
        res
          .status(400)
          .json({
            message: 'Invalid status. Must be "Approved" or "Rejected".',
          });
        return;
      }

      console.log(
        `CLAIM_CONTROLLER: Calling service to update claim ${claimId} to ${status}`
      );
      const updatedClaim = await ClaimService.updateClaimStatus(
        claimId,
        status,
        req.user.id,
        rejection_reason
      );

      if (!updatedClaim) {
        console.error(
          `CLAIM_CONTROLLER: Claim ${claimId} not found by service or update failed.`
        );
        res
          .status(404)
          .json({ message: "Claim not found or could not be updated." });
        return;
      }
      console.log(
        `CLAIM_CONTROLLER: Claim ${claimId} status updated successfully.`
      );
      const claimObject = updatedClaim.toObject({
        virtuals: true,
        getters: true,
      });
      if (!claimObject.id && claimObject._id) {
        claimObject.id = claimObject._id.toString();
      }
      delete claimObject._id;
      delete claimObject.__v;
      res.status(200).json(claimObject);
    } catch (error: any) {
      console.error(
        "CLAIM_CONTROLLER: Error in handleUpdateClaimStatus:",
        error.message,
        error.stack
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while updating claim status.",
        });
    }
  }
}
