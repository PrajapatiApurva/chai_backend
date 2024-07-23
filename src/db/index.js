import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected!! \nInstance Info: ${connectionInstance} DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
};

export default connectDB
