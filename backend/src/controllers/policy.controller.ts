import { Request, Response, NextFunction } from "express";
import { PolicyService } from "../services/policy.service";
import UserModel, { IUser } from "../models/user.model"; // Import IUser
import { IPolicy } from "../models/policy.model";
import mongoose from "mongoose";

const transformPolicyForClient = (policyDoc: IPolicy) => {
  const policyObject = policyDoc.toObject
    ? policyDoc.toObject({ virtuals: true, getters: true })
    : { ...policyDoc };

  if (!policyObject.id && policyObject._id) {
    policyObject.id = policyObject._id.toString();
  }

  // Transform populated policyholder_id to user field for client
  if (
    policyObject.policyholder_id &&
    typeof policyObject.policyholder_id === "object"
  ) {
    const ph = policyObject.policyholder_id as unknown as IUser; // Cast to IUser
    policyObject.user = {
      id: ph._id ? ph._id.toString() : (ph as any).id, // Use _id or id if available
      firstName: ph.firstName,
      lastName: ph.lastName,
      email: ph.email,
    };
  } else if (
    typeof policyObject.policyholder_id === "string" ||
    policyObject.policyholder_id instanceof mongoose.Types.ObjectId
  ) {
    // If only ID is present (not populated in some cases, or if you want to send just ID)
    // For AdminPolicies.tsx, we expect it to be populated by the service
    // This else-if is more of a fallback for other scenarios or direct ID sending.
    // However, for current getAllPolicies which populates it, this block won't be hit for policyholder_id.
    policyObject.user = { id: policyObject.policyholder_id.toString() }; // Only id, no name/email
  }

  delete policyObject._id;
  delete policyObject.__v;
  // Optionally delete policyholder_id if client only uses policy.user
  // delete policyObject.policyholder_id;

  return policyObject;
};

export class PolicyController {
  static async handleCreatePolicy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let policyholder_id_from_req: string | undefined = req.body.user_id;
      let policyholder_id: string;

      if (policyholder_id_from_req) {
        policyholder_id = policyholder_id_from_req;
      } else if (req.user?.id) {
        policyholder_id = req.user.id;
      } else {
        const testUser = await UserModel.findOne().select("_id").lean();
        if (testUser && testUser._id) {
          policyholder_id = testUser._id.toString();
        } else {
          res
            .status(400)
            .json({
              message:
                "Policyholder ID (user_id) is required and no fallback user found.",
            });
          return;
        }
      }

      const {
        policy_type,
        coverage_amount,
        premium_amount,
        start_date,
        end_date,
        description,
        terms_conditions,
        policy_document_url,
        created_by,
      } = req.body;

      if (
        !policy_type ||
        coverage_amount == null ||
        premium_amount == null ||
        !start_date ||
        !end_date
      ) {
        res
          .status(400)
          .json({
            message:
              "Missing required policy fields (type, coverage, premium, dates).",
          });
        return;
      }

      const policyDataToService = {
        policyholder_id,
        policy_type,
        coverage_amount: Number(coverage_amount),
        premium_amount: Number(premium_amount),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        description,
        terms_conditions,
        policy_document_url,
        created_by,
      };

      const newPolicy = await PolicyService.createPolicy(policyDataToService);
      res.status(201).json(transformPolicyForClient(newPolicy));
    } catch (error: any) {
      console.error(
        "Error in PolicyController.handleCreatePolicy:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while creating the policy.",
        });
    }
  }

  static async handleGetUserPolicies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res
          .status(401)
          .json({ message: "Authentication required to fetch user policies." });
        return;
      }
      const userId = req.user.id;
      const policies = await PolicyService.getPoliciesByUserId(userId);
      res.status(200).json(policies.map(transformPolicyForClient));
    } catch (error: any) {
      console.error(
        "Error in PolicyController.handleGetUserPolicies:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching user policies.",
        });
    }
  }

  static async handleGetAllPolicies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required." });
        return;
      }
      const policies = await PolicyService.getAllPolicies();
      res.status(200).json(policies.map(transformPolicyForClient));
    } catch (error: any) {
      console.error(
        "Error in PolicyController.handleGetAllPolicies:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching all policies.",
        });
    }
  }

  static async handleGetPolicyById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const policyId = req.params.id;

      if (
        !policyId ||
        policyId === "undefined" ||
        !mongoose.Types.ObjectId.isValid(policyId)
      ) {
        res.status(400).json({ message: "Invalid Policy ID format." });
        return;
      }

      const policy = await PolicyService.getPolicyById(policyId);

      if (!policy) {
        res.status(404).json({ message: "Policy not found." });
        return;
      }

      res.status(200).json(transformPolicyForClient(policy));
    } catch (error: any) {
      console.error(
        "Error in PolicyController.handleGetPolicyById:",
        error.message
      );
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching policy details.",
        });
    }
  }
}
