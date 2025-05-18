import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  themePreference?: string;
  passwordResetToken?: string; // New field
  passwordResetExpires?: Date; // New field
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: (props: any) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    profileImageUrl: { type: String, trim: true },
    themePreference: { type: String, trim: true, default: "system" },
    passwordResetToken: { type: String, select: false }, // New field
    passwordResetExpires: { type: Date, select: false }, // New field
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    if (this.isModified()) this.updatedAt = new Date(); // Still update updatedAt if other fields change
    return next();
  }
  this.updatedAt = new Date();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.pre<IUser>(["updateOne", "findOneAndUpdate"], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
