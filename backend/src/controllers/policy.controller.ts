import { Request, Response, NextFunction } from "express";
import { PolicyService } from "../services/policy.service";
import UserModel, { IUser } from "../models/user.model";
import { IPolicy } from "../models/policy.model";
import mongoose, { Types } from "mongoose";

const transformPolicyForClient = (policyDoc: IPolicy) => {
  const policyObject = policyDoc.toObject
    ? policyDoc.toObject({ virtuals: true, getters: true })
    : { ...policyDoc };
  if (!policyObject.id && policyObject._id) {
    policyObject.id = policyObject._id.toString();
  }

  if (
    policyObject.policyholder_id &&
    typeof policyObject.policyholder_id === "object" &&
    policyObject.policyholder_id !== null &&
    !Array.isArray(policyObject.policyholder_id)
  ) {
    const ph = policyObject.policyholder_id as unknown as IUser & {
      _id?: Types.ObjectId;
      id?: string;
    };
    policyObject.user = {
      id: ph.id || (ph._id ? ph._id.toString() : undefined),
      firstName: ph.firstName,
      lastName: ph.lastName,
      email: ph.email,
    };
  } else if (
    typeof policyObject.policyholder_id === "string" ||
    policyObject.policyholder_id instanceof mongoose.Types.ObjectId
  ) {
    policyObject.user = { id: policyObject.policyholder_id.toString() };
  }

  delete policyObject._id;
  delete policyObject.__v;

  return policyObject;
};

export class PolicyController {
  static async handleCreatePolicy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("POLICY_CONTROLLER: handleCreatePolicy called.");
    console.log("POLICY_CONTROLLER: Request body:", req.body);
    console.log(
      "POLICY_CONTROLLER: Authenticated user (from token):",
      req.user
    );

    try {
      let policyholder_id_from_body: string | undefined = req.body.user_id; // Frontend sends user_id
      let policyholder_id: string;

      if (
        policyholder_id_from_body &&
        Types.ObjectId.isValid(policyholder_id_from_body)
      ) {
        policyholder_id = policyholder_id_from_body;
        console.log(
          `POLICY_CONTROLLER: policyholder_id taken from req.body.user_id: ${policyholder_id}`
        );
      } else if (req.user?.id && Types.ObjectId.isValid(req.user.id)) {
        policyholder_id = req.user.id;
        console.log(
          `POLICY_CONTROLLER: policyholder_id taken from req.user.id: ${policyholder_id}`
        );
      } else {
        console.error(
          "POLICY_CONTROLLER: Valid policyholder_id (user_id) is required and not found or invalid."
        );
        res
          .status(400)
          .json({ message: "Valid policyholder ID (user_id) is required." });
        return;
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
      } = req.body;

      let created_by_id: string | undefined = undefined;
      if (req.user?.id && Types.ObjectId.isValid(req.user.id)) {
        // Assuming creator is the authenticated user
        created_by_id = req.user.id;
      }

      console.log(
        `POLICY_CONTROLLER: Extracted from body - type: ${policy_type}, coverage: ${coverage_amount}, premium: ${premium_amount}, start: ${start_date}, end: ${end_date}`
      );

      if (
        !policy_type ||
        coverage_amount == null ||
        premium_amount == null ||
        !start_date ||
        !end_date
      ) {
        console.error(
          "POLICY_CONTROLLER: Missing required policy fields in request body."
        );
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
        created_by: created_by_id,
      };
      console.log(
        "POLICY_CONTROLLER: Prepared policyData for service:",
        policyDataToService
      );

      const newPolicy = await PolicyService.createPolicy(policyDataToService);
      console.log(
        "POLICY_CONTROLLER: Policy created by service, ID:",
        newPolicy.id || newPolicy._id
      );
      res.status(201).json(transformPolicyForClient(newPolicy));
    } catch (error: any) {
      console.error(
        "POLICY_CONTROLLER: Error in handleCreatePolicy:",
        error.message,
        error.stack
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
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching policy details.",
        });
    }
  }
}
