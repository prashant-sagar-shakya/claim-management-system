import SettingsModel, { ISettings } from "../models/setting.model";

// Define a type for the update payload, excluding IDs and timestamps
type SettingsUpdatePayload = Partial<
  Omit<ISettings, "_id" | "id" | "createdAt" | "updatedAt">
>;

export class SettingService {
  static async getSettings(): Promise<ISettings | null> {
    try {
      let settings = await SettingsModel.findOne();
      if (!settings) {
        // If no settings doc exists, create one with defaults
        console.log(
          "SETTINGS_SERVICE: No settings found, creating default settings document."
        );
        settings = new SettingsModel({}); // Mongoose schema defaults will apply
        await settings.save();
      }
      return settings;
    } catch (error: any) {
      console.error("Error in SettingService.getSettings:", error.message);
      throw new Error(error.message || "Failed to fetch settings.");
    }
  }

  static async updateSettings(
    updateData: SettingsUpdatePayload
  ): Promise<ISettings | null> {
    try {
      const settings = await SettingsModel.findOneAndUpdate(
        {}, // Find the single settings document
        { $set: updateData },
        { new: true, upsert: true, runValidators: true } // Upsert will create if not exists
      );
      return settings;
    } catch (error: any) {
      console.error("Error in SettingService.updateSettings:", error.message);
      throw new Error(error.message || "Failed to update settings.");
    }
  }
}
