import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://proviewers:V5rP7dwO0Avwp2Zu@cluster0.3b57c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log("MongoDB is already connected (Backend)");
    return;
  }

  if (!MONGODB_URI) {
    console.error(
      "FATAL ERROR: MONGODB_URI is not defined in environment variables for backend."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected successfully (Backend)");
  } catch (error) {
    console.error("Error connecting to MongoDB (Backend):", error);
    process.exit(1);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected successfully (Backend)");
  } catch (error) {
    console.error("Error disconnecting from MongoDB (Backend):", error);
  }
};

export { mongoose };
