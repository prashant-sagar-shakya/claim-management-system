import { Request, Response, NextFunction } from "express";
import { SettingService } from "../services/setting.service";
import { ISettings } from "../models/setting.model";

export class SettingController {
  static async handleGetSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await SettingService.getSettings();
      if (!settings) {
        // This case should be handled by service creating defaults, but as a fallback:
        res
          .status(404)
          .json({
            message: "Settings not found and could not be initialized.",
          });
        return;
      }
      res.status(200).json(settings); // Service should return toObject() or controller can do it
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Failed to retrieve settings." });
    }
  }

  static async handleUpdateSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Basic validation for expected fields, more robust validation with Zod/Joi is better
      const { siteName, maintenanceMode, recordsPerPage } = req.body;
      const updateData: Partial<
        Omit<ISettings, "_id" | "id" | "createdAt" | "updatedAt">
      > = {};

      if (typeof siteName === "string") updateData.siteName = siteName;
      if (typeof maintenanceMode === "boolean")
        updateData.maintenanceMode = maintenanceMode;
      if (typeof recordsPerPage === "number") {
        if (recordsPerPage >= 5 && recordsPerPage <= 50) {
          updateData.recordsPerPage = recordsPerPage;
        } else {
          res
            .status(400)
            .json({ message: "Records per page must be between 5 and 50." });
          return;
        }
      }

      if (Object.keys(updateData).length === 0) {
        res
          .status(400)
          .json({ message: "No valid settings data provided for update." });
        return;
      }

      const updatedSettings = await SettingService.updateSettings(updateData);
      if (!updatedSettings) {
        res
          .status(500)
          .json({
            message:
              "Failed to update settings or settings could not be initialized.",
          });
        return;
      }
      res.status(200).json(updatedSettings);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Failed to update settings." });
    }
  }
}
