import mongoose, { Schema, Document } from "mongoose";

export interface ISettingEntry {
  key: string;
  value: any;
}
export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  siteName: string;
  maintenanceMode: boolean;
  recordsPerPage: number;
  // Add other settings as needed
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema: Schema<ISettings> = new mongoose.Schema(
  {
    siteName: { type: String, default: "Insurance Portal", trim: true },
    maintenanceMode: { type: Boolean, default: false },
    recordsPerPage: { type: Number, default: 10, min: 5, max: 50 },
  },
  {
    timestamps: true,
    collection: "settings", // Explicitly name the collection
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const SettingsModel = mongoose.model<ISettings>("Settings", settingsSchema);
export default SettingsModel;
