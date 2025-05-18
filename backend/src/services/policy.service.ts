import PolicyModel, { IPolicy } from "../models/policy.model";
import { Types } from "mongoose";
import { IUser } from "../models/user.model";

type CreatePolicyInputData = Pick<
  IPolicy,
  | "policy_type"
  | "coverage_amount"
  | "premium_amount"
  | "start_date"
  | "end_date"
> &
  Partial<
    Pick<IPolicy, "description" | "terms_conditions" | "policy_document_url">
  > & {
    policyholder_id: string | Types.ObjectId;
    created_by?: string | Types.ObjectId; // created_by is optional
  };

export class PolicyService {
  static async createPolicy(
    policyInputData: CreatePolicyInputData
  ): Promise<IPolicy> {
    try {
      const policy_number = `POL-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

      const newPolicyDocumentData: Partial<IPolicy> = {
        policy_number,
        is_active: true,
        policy_type: policyInputData.policy_type,
        coverage_amount: policyInputData.coverage_amount,
        premium_amount: policyInputData.premium_amount,
        start_date: policyInputData.start_date,
        end_date: policyInputData.end_date,
        policyholder_id: new Types.ObjectId(
          policyInputData.policyholder_id
        ) as any,
        description: policyInputData.description,
        terms_conditions: policyInputData.terms_conditions,
        policy_document_url: policyInputData.policy_document_url,
      };

      if (policyInputData.created_by) {
        newPolicyDocumentData.created_by = new Types.ObjectId(
          policyInputData.created_by
        ) as any;
      }

      const newPolicy = new PolicyModel(newPolicyDocumentData);
      await newPolicy.save();
      return newPolicy;
    } catch (error: any) {
      console.error("Error in PolicyService.createPolicy:", error.message);
      if (error.code === 11000) {
        throw new Error(
          "Failed to generate a unique policy number, please try again."
        );
      }
      throw new Error(error.message || "Failed to create policy.");
    }
  }

  static async getPoliciesByUserId(
    userId: string | Types.ObjectId
  ): Promise<IPolicy[]> {
    try {
      const policies = await PolicyModel.find({
        policyholder_id: new Types.ObjectId(userId),
      })
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email _id id" // Ensure id or _id is populated
        )
        .sort({ createdAt: -1 });
      return policies;
    } catch (error: any) {
      console.error(
        "Error in PolicyService.getPoliciesByUserId:",
        error.message
      );
      throw new Error(error.message || "Failed to fetch user policies.");
    }
  }

  static async getAllPolicies(): Promise<IPolicy[]> {
    try {
      const policies = await PolicyModel.find()
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email _id id" // Ensure id or _id is populated
        )
        .sort({ createdAt: -1 });
      return policies;
    } catch (error: any) {
      console.error("Error in PolicyService.getAllPolicies:", error.message);
      throw new Error(error.message || "Failed to fetch all policies.");
    }
  }

  static async getPolicyById(
    policyId: string | Types.ObjectId
  ): Promise<IPolicy | null> {
    try {
      const policy = await PolicyModel.findById(policyId).populate<{
        policyholder_id: IUser;
      }>("policyholder_id", "firstName lastName email _id id"); // Ensure id or _id is populated
      return policy;
    } catch (error: any) {
      console.error("Error in PolicyService.getPolicyById:", error.message);
      throw new Error(error.message || "Failed to fetch policy details.");
    }
  }
}
