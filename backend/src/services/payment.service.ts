import PaymentModel, { IPayment } from "../models/payment.model";
import { Types } from "mongoose";
import { IPolicy } from "../models/policy.model";
import { IUser } from "../models/user.model";

type CreatePaymentInputData = Pick<
  IPayment,
  "amount" | "payment_type" | "payment_date" | "status"
> &
  Partial<
    Pick<
      IPayment,
      "transaction_id" | "description" | "receipt_url" | "processed_at"
    >
  > & {
    policy_id: string | Types.ObjectId;
    policyholder_id: string | Types.ObjectId;
    processed_by?: string | Types.ObjectId;
    payment_number?: string;
  };

export class PaymentService {
  static async createPayment(
    paymentInputData: CreatePaymentInputData
  ): Promise<IPayment> {
    try {
      const payment_number =
        paymentInputData.payment_number ||
        `PAY-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`;

      const newPaymentDocumentData: Partial<IPayment> & {
        policy_id: Types.ObjectId;
        policyholder_id: Types.ObjectId;
      } = {
        amount: paymentInputData.amount,
        payment_type: paymentInputData.payment_type,
        payment_date: paymentInputData.payment_date,
        status: paymentInputData.status,
        transaction_id: paymentInputData.transaction_id,
        description: paymentInputData.description,
        receipt_url: paymentInputData.receipt_url,
        processed_at: paymentInputData.processed_at,
        payment_number,
        policy_id: new Types.ObjectId(paymentInputData.policy_id),
        policyholder_id: new Types.ObjectId(paymentInputData.policyholder_id),
      };

      if (paymentInputData.processed_by) {
        // Ensure processed_by is a valid string or ObjectId before converting
        if (
          typeof paymentInputData.processed_by === "string" ||
          paymentInputData.processed_by instanceof Types.ObjectId
        ) {
          newPaymentDocumentData.processed_by = new Types.ObjectId(
            paymentInputData.processed_by
          ) as any;
        } else {
          // Handle cases where it might be something else if your logic allows,
          // or throw an error for invalid type if only string/ObjectId are expected.
          console.warn(
            "processed_by field in paymentInputData was neither string nor ObjectId, skipping."
          );
        }
      }

      const newPayment = new PaymentModel(newPaymentDocumentData);
      await newPayment.save();
      return newPayment;
    } catch (error: any) {
      console.error("Error in PaymentService.createPayment:", error.message);
      if (error.code === 11000) {
        throw new Error(
          "Failed to generate a unique payment number, please try again."
        );
      }
      throw new Error(error.message || "Failed to create payment.");
    }
  }

  static async getPaymentsByUserId(
    userId: string | Types.ObjectId
  ): Promise<IPayment[]> {
    try {
      const payments = await PaymentModel.find({
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
        .sort({ payment_date: -1 });
      return payments;
    } catch (error: any) {
      console.error(
        "Error in PaymentService.getPaymentsByUserId:",
        error.message
      );
      throw new Error(error.message || "Failed to fetch user payments.");
    }
  }

  static async getAllPayments(): Promise<IPayment[]> {
    try {
      const payments = await PaymentModel.find()
        .populate<{ policyholder_id: IUser }>(
          "policyholder_id",
          "firstName lastName email"
        )
        .populate<{ policy_id: IPolicy }>(
          "policy_id",
          "policy_type policy_number"
        )
        .sort({ payment_date: -1 });
      return payments;
    } catch (error: any) {
      console.error("Error in PaymentService.getAllPayments:", error.message);
      throw new Error(error.message || "Failed to fetch all payments.");
    }
  }
}
