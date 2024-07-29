import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { fileUploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Register user logic here
  // get user details from frontend
  // validation - not empty
  // check if user already exist in Database, check using: username, email
  // check for images, check for avatar
  // If all clear then upload them on Cloudinary, check avatar
  // create user Object - Create entry in Db
  // remove password and refresh token field from the Respose
  // check for user Creation --> whether it is created or not.
  // return response

  const { username, email, fullname, password } = req.body;

  // if(username === ""){
  //   throw new ApiError(400, "Fullname is required...");
  // }  --> you can do this for every individual field or you can use Array oncept of JS.

  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required...");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already Exists.");
  }

  // req.files is given access by Multer which we have used in "user.routes"
  // req.files?.avatar[0]?.path  --> first property of avatar is an object if exists, which has various data but path is the one which we will use.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // it is not guaranteed that you will always have array of coverImage as it is not a required Field..
  // So this line can cause Error of -->TypeError: Cannot read properties of undefined (reading '0')

  // Instead, use this conventional lines:
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // const fileInfo = req.files;
  // console.log(fileInfo); // will delete it later

  // Here in our project avatar file is required
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required...");
  }

  const avatar = await fileUploadOnCloudinary(avatarLocalPath);
  const coverImage = await fileUploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required...");
  }

  const userObj = {
    username: username.toLowerCase(),
    email,
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  };
  const user = await User.create(userObj);

  const craetedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!craetedUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the User..."
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, craetedUser, "User registerd successfully!!!"));
});

export { registerUser };
