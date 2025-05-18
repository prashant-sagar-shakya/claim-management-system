import ClaimModel, { IClaim } from "../models/claim.model";
import { Types } from "mongoose";
import { IPolicy } from "../models/policy.model";
import { IUser } from "../models/user.model";

type CreateClaimInputData = Pick<
  IClaim,
  "claim_amount" | "incident_date" | "description"
> & {
  policy_id: string | Types.ObjectId;
  policyholder_id: string | Types.ObjectId;
  claim_number?: string;
};

export class ClaimService {
  static async createClaim(
    claimInputData: CreateClaimInputData
  ): Promise<IClaim> {
    console.log("CLAIM_SERVICE: createClaim called with data:", claimInputData);
    try {
      const claim_number =
        claimInputData.claim_number ||
        `CLM-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`;
      console.log(`CLAIM_SERVICE: Generated claim_number: ${claim_number}`);

      const newClaimDocumentData: Partial<IClaim> = {
        claim_number,
        policy_id: new Types.ObjectId(claimInputData.policy_id),
        policyholder_id: new Types.ObjectId(claimInputData.policyholder_id),
        claim_amount: claimInputData.claim_amount,
        incident_date: new Date(claimInputData.incident_date),
        description: claimInputData.description,
        status: "Pending",
        claim_date: new Date(),
      };
      console.log(
        "CLAIM_SERVICE: Document data for new ClaimModel:",
        newClaimDocumentData
      );

      const newClaim = new ClaimModel(newClaimDocumentData);
      await newClaim.save();
      console.log("CLAIM_SERVICE: Claim saved successfully, ID:", newClaim._id);
      return newClaim;
    } catch (error: any) {
      console.error(
        "CLAIM_SERVICE: Error in createClaim:",
        error.message,
        error.stack
      );
      if (error.code === 11000) {
        throw new Error(
          "Failed to generate a unique claim number, please try again."
        );
      }
      throw new Error(error.message || "Failed to create claim.");
    }
  }

  static async getClaimsByUserId(
    userId: string | Types.ObjectId
  ): Promise<IClaim[]> {
    console.log(
      `CLAIM_SERVICE: getClaimsByUserId called for userId: ${userId}`
    );
    try {
      const claims = await ClaimModel.find({
        policyholder_id: new Types.ObjectId(userId),
      })
        .populate<{ policy_id: IPolicy }>(
          "policy_id",
          "policy_type policy_number"
        )
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email"
        )
        .sort({ claim_date: -1 });
      console.log(
        `CLAIM_SERVICE: Found ${claims.length} claims for userId: ${userId}`
      );
      return claims;
    } catch (error: any) {
      console.error(
        "CLAIM_SERVICE: Error in getClaimsByUserId:",
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to fetch user claims.");
    }
  }

  static async getAllClaims(): Promise<IClaim[]> {
    console.log("CLAIM_SERVICE: getAllClaims called.");
    try {
      const claims = await ClaimModel.find()
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email"
        )
        .populate<{ policy_id: IPolicy }>(
          "policy_id",
          "policy_type policy_number"
        )
        .sort({ claim_date: -1 });
      console.log(`CLAIM_SERVICE: Found ${claims.length} total claims.`);
      return claims;
    } catch (error: any) {
      console.error(
        "CLAIM_SERVICE: Error in getAllClaims:",
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to fetch all claims.");
    }
  }

  static async getClaimById(
    claimId: string | Types.ObjectId
  ): Promise<IClaim | null> {
    console.log(`CLAIM_SERVICE: getClaimById called for claimId: ${claimId}`);
    try {
      const claim = await ClaimModel.findById(claimId)
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email"
        )
        .populate<{ policy_id: IPolicy }>(
          "policy_id",
          "policy_type policy_number description"
        );
      console.log(`CLAIM_SERVICE: Claim found by ID (${claimId}):`, !!claim);
      return claim;
    } catch (error: any) {
      console.error(
        "CLAIM_SERVICE: Error in getClaimById:",
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to fetch claim details.");
    }
  }

  static async updateClaimStatus(
    claimId: string | Types.ObjectId,
    status: "Approved" | "Rejected",
    processedByAdminId: string | Types.ObjectId,
    rejection_reason?: string
  ): Promise<IClaim | null> {
    console.log(
      `CLAIM_SERVICE: updateClaimStatus called for claimId: ${claimId}, new status: ${status}, adminId: ${processedByAdminId}`
    );
    try {
      const updateData: any = {
        status,
        processed_by: new Types.ObjectId(processedByAdminId),
        processed_at: new Date(),
      };
      if (status === "Rejected" && rejection_reason) {
        updateData.rejection_reason = rejection_reason;
      } else if (status === "Approved") {
        updateData.rejection_reason = undefined;
      }
      console.log("CLAIM_SERVICE: Update data for claim status:", updateData);

      const updatedClaim = await ClaimModel.findByIdAndUpdate(
        claimId,
        { $set: updateData },
        { new: true }
      )
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email"
        )
        .populate<{ policy_id: IPolicy }>(
          "policy_id",
          "policy_type policy_number"
        );
      console.log(
        `CLAIM_SERVICE: Claim status updated for ${claimId}:`,
        !!updatedClaim
      );
      return updatedClaim;
    } catch (error: any) {
      console.error(
        "CLAIM_SERVICE: Error in updateClaimStatus:",
        error.message,
        error.stack
      );
      throw new Error(error.message || "Failed to update claim status.");
    }
  }
}
