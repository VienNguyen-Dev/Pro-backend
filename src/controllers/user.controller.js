import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user from user frontend
  //validation - notempty
  //check if user already exist: username, email
  //Check with image, check with avatar
  //upload image file on cloudinary
  //create user object - a object empty in db
  //remove password and refresh token field from response
  //check to user creation
  //response

  const { fullName, username, email, password } = req.body;
  if ([fullName, username, email, password].some((field) =>
    field?.trim() === ""
  )) {
    throw new ApiError(400, `All field are required`)
  }

  const existUserByUsernameOrEmail = await User.findOne({
    $or: [
      { username },
      { email }
    ]
  });
  if (existUserByUsernameOrEmail) {
    throw new ApiError(409, "User with username or email already exist");
  }

  const avatarLocalPath = req.file?.avatar[0]?.path;
  const coverImageLocalPath = req.file?.coverImage?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
  })
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering new user")
  }
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
})


const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Success"
  })
})

export { registerUser }