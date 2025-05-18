import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose";
import { IUser } from "./user.model";

export interface IPolicy extends Document {
  _id: Types.ObjectId;
  id: string; // For virtual
  policy_number: string;
  policyholder_id: PopulatedDoc<IUser & Document>;
  policy_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  description?: string;
  terms_conditions?: string;
  policy_document_url?: string;
  created_by?: PopulatedDoc<IUser & Document>;
  createdAt: Date; // from timestamps
  updatedAt: Date; // from timestamps
}

const policySchema: Schema<IPolicy> = new mongoose.Schema(
  {
    policy_number: {
      type: String,
      required: true,
      unique: true,
    },
    policyholder_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    policy_type: {
      type: String,
      required: true,
    },
    coverage_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    premium_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
    terms_conditions: {
      type: String,
    },
    policy_document_url: {
      type: String,
      trim: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Mongoose by default creates a virtual 'id' that's a string version of '_id'.
// If you want to be explicit or if it's not working:
// policySchema.virtual('id').get(function() {
//   return this._id.toHexString();
// });

const PolicyModel = mongoose.model<IPolicy>("Policy", policySchema);

export default PolicyModel;
