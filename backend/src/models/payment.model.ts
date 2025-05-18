import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose";
import { IPolicy } from "./policy.model"; // For populated policy
import { IUser } from "./user.model"; // For populated user

export interface IPayment extends Document {
  _id: Types.ObjectId;
  payment_number: string;
  policy_id: PopulatedDoc<IPolicy & Document>; // Can be ObjectId or populated IPolicy
  policyholder_id: PopulatedDoc<IUser & Document>; // Can be ObjectId or populated IUser
  amount: number;
  payment_type: string;
  payment_date: Date;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  transaction_id?: string;
  description?: string;
  receipt_url?: string;
  processed_by?: PopulatedDoc<IUser & Document>;
  processed_at?: Date;
  // createdAt and updatedAt will be handled by timestamps: true
}

const paymentSchema: Schema<IPayment> = new mongoose.Schema(
  {
    payment_number: {
      type: String,
      required: true,
      unique: true,
    },
    policy_id: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    policyholder_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_type: {
      type: String,
      required: true,
    },
    payment_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Completed",
    },
    transaction_id: { type: String },
    description: { type: String },
    receipt_url: { type: String },
    processed_by: { type: Schema.Types.ObjectId, ref: "User" },
    processed_at: { type: Date },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);

export default PaymentModel;
