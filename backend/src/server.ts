import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db";
import { AuthService } from "./services/auth.service";
import UserModel, { IUser } from "./models/user.model";
import authRoutes from "./routes/auth.routes";
import policyRoutes from "./routes/policy.routes";
import claimRoutes from "./routes/claim.routes";
import paymentRoutes from "./routes/payment.routes";
import settingRoutes from "./routes/setting.routes"; // Import setting routes
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
console.log("ADMIN ROUTES MOUNTED AT /api/admin");
app.use("/api/settings", settingRoutes); // Use setting routes

// ... (rest of server.ts as before) ...
app.put("/api/users/profile", async (req: Request, res: Response) => {
  const testUserIdFromHeader = req.headers["x-user-id"] as string;
  const testUserIdFromBody = req.body.userIdForUpdate;

  let userIdToUse = testUserIdFromHeader || testUserIdFromBody;

  if (!userIdToUse) {
    try {
      const firstUser: IUser | null = await UserModel.findOne()
        .select("_id")
        .lean();

      if (firstUser && firstUser._id) {
        userIdToUse = firstUser._id.toString();
      } else {
        console.warn(
          "No user found in DB to pick an ID for profile update, and no user ID provided."
        );
        return res
          .status(404)
          .json({ message: "No user ID available for profile update." });
      }
    } catch (dbError: any) {
      console.error("DB error finding a user for profile update:", dbError);
      return res
        .status(500)
        .json({
          message:
            "Database error while trying to find a user for profile update.",
        });
    }
  }

  if (typeof userIdToUse !== "string") {
    console.error(
      "userIdToUse for profile update is not a string:",
      userIdToUse
    );
    return res
      .status(400)
      .json({ message: "Invalid User ID for profile update." });
  }

  const { userIdForUpdate, ...updateData } = req.body;

  try {
    const updatedUser = await AuthService.updateUserProfile(
      userIdToUse,
      updateData
    );
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Profile Update Error in route:", error.message);
    if (error.message.includes("User not found")) {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: error.message || "Failed to update profile." });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Insurance Management System API (Backend) is running!");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).send("Something broke on the server!");
});

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
      console.log(`CORS configured for origin: ${frontendUrl}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
