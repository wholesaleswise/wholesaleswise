import mongoose from "mongoose";
import "dotenv/config";

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("Already connected to the database");
    return;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error({
      message: "Database connection failed",
      error: error.message,
    });
  }
};

export default connectToDatabase;
