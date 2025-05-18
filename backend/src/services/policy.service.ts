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
    created_by?: string | Types.ObjectId;
  };

export class PolicyService {
  static async createPolicy(
    policyInputData: CreatePolicyInputData
  ): Promise<IPolicy> {
    console.log(
      "POLICY_SERVICE: createPolicy called with data:",
      JSON.stringify(policyInputData, null, 2)
    );
    try {
      const policy_number = `POL-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;
      console.log(`POLICY_SERVICE: Generated policy_number: ${policy_number}`);

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

      console.log(
        "POLICY_SERVICE: Document data for new PolicyModel:",
        JSON.stringify(newPolicyDocumentData, null, 2)
      );

      const newPolicy = new PolicyModel(newPolicyDocumentData);
      await newPolicy.save();
      console.log(
        "POLICY_SERVICE: Policy saved successfully, ID:",
        newPolicy._id.toString()
      );
      return newPolicy;
    } catch (error: any) {
      console.error(
        "POLICY_SERVICE: Error in createPolicy:",
        error.message,
        error.stack
      );
      if (error.code === 11000) {
        throw new Error(
          "Failed to generate a unique policy number, please try again."
        );
      }
      if (error.name === "ValidationError") {
        console.error(
          "POLICY_SERVICE: Mongoose Validation Error details:",
          JSON.stringify(error.errors, null, 2)
        );
      }
      throw new Error(error.message || "Failed to create policy.");
    }
  }

  static async getPoliciesByUserId(
    userId: string | Types.ObjectId
  ): Promise<IPolicy[]> {
    /* ... as before ... */
    try {
      const policies = await PolicyModel.find({
        policyholder_id: new Types.ObjectId(userId),
      })
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email _id id"
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
    /* ... as before ... */
    try {
      const policies = await PolicyModel.find()
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email _id id"
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
    /* ... as before ... */
    try {
      const policy = await PolicyModel.findById(policyId).populate<{
        policyholder_id: IUser;
      }>("policyholder_id", "firstName lastName email _id id");
      return policy;
    } catch (error: any) {
      console.error("Error in PolicyService.getPolicyById:", error.message);
      throw new Error(error.message || "Failed to fetch policy details.");
    }
  }
}
