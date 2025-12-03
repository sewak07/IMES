import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' }); 

const connectDb = async () => {
  try {
    if (!process.env.URI) {
      throw new Error("MongoDB URI is missing in .env file!");
    }
    await mongoose.connect(process.env.URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

export default connectDb;
