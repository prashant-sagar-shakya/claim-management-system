import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose";
import { IPolicy } from "./policy.model"; // For populated policy
import { IUser } from "./user.model"; // For populated user

export interface IClaimDocument {
  document_type: string;
  document_url: string;
  uploaded_at: Date;
}

export interface IClaimNote {
  content: string;
  added_by: PopulatedDoc<IUser & Document>; // Can be ObjectId or IUser
  added_at: Date;
}

export interface IClaim extends Document {
  _id: Types.ObjectId;
  claim_number: string;
  policy_id: PopulatedDoc<IPolicy & Document>; // Can be ObjectId or IPolicy document
  policyholder_id: PopulatedDoc<IUser & Document>; // Can be ObjectId or IUser document
  claim_amount: number;
  claim_date: Date;
  incident_date: Date;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Paid";
  description: string;
  supporting_documents: IClaimDocument[];
  notes: IClaimNote[];
  rejection_reason?: string;
  processed_by?: PopulatedDoc<IUser & Document>;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const claimSchema: Schema<IClaim> = new mongoose.Schema(
  {
    claim_number: {
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
    claim_amount: { type: Number, required: true, min: 0 },
    claim_date: { type: Date, required: true, default: Date.now },
    incident_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Approved", "Rejected", "Paid"],
      default: "Pending",
    },
    description: { type: String, required: true },
    supporting_documents: [
      {
        document_type: String,
        document_url: String,
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    notes: [
      {
        content: String,
        added_by: { type: Schema.Types.ObjectId, ref: "User" },
        added_at: { type: Date, default: Date.now },
      },
    ],
    rejection_reason: { type: String },
    processed_by: { type: Schema.Types.ObjectId, ref: "User" },
    processed_at: { type: Date },
  },
  { timestamps: true }
); // Using timestamps for createdAt and updatedAt

const ClaimModel = mongoose.model<IClaim>("Claim", claimSchema);

export default ClaimModel;