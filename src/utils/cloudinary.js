import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File not found...");
      return null;
    }
    // File upload starts here...
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File uploaded successfully
    console.log(
      "File has been uploaded successfully, and the response is:\n",
      response
    );

    return response; //it's better if we return only "response.url" but since I am in my learning phase so I wanted to know what's inside the response.
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    console.log(error);
    return null;
  }
};

export { fileUploadOnCloudinary };
