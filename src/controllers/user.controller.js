import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { fileUploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Tokens..."
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required...");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(
      404,
      "User with given username or email does not exist..."
    );
  }

  // User e mongoose ni methods access karva mate use thaay.
  // To use self created methods, use user(self created object from User)
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password...");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully!!!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Kyathi laaya? userId to
  // auth.middleware.js maathi laaya,
  // je middleware use karyu chhe, user.routes.js na "/logout" route maa.
  const userId = req.user._id;
  await User.findByIdAndUpdate(
    userId,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out Successfully!!!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request...");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token...");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used...");
    }

    const options = {
      httpOnly: true,
      secured: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed..."
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token...");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
