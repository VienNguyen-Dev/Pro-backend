import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generate access and refredsh token");
  }
}

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

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // let coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
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
  //req.body -> data
  //check data validation
  // check user already exist with email oer username
  // compare paaword
  // access and refresh token
  //send cookie

  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required")
  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (!user) {
    throw new ApiError(404, "User not exist")
  }

  const isComparePassword = await user.isPasswordCorrect(password);
  if (!isComparePassword) {
    throw new ApiError(401, "Invalid user creadentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const loggedInUser = await User
    .findById(user._id)
    .select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In successfully"
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  //clear token
  //logout user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined }
    },
    { new: true }
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User log out")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const isComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!isComingRefreshToken) {
      throw new ApiError(400, "Unauthorized request")
    }
    const decodedToken = jwt.verify(
      isComingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }
    if (isComingRefreshToken !== user.refreshToken) {
      throw new ApiResponse(400, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newefreshToken } = await generateAccessAndRefreshToken(user._id);
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //1. check old password
  //take data from frontend
  //compare password and comfirm password
  //response
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isComparePassword = await user.isPasswordCorrect(oldPassword);
  if (!isComparePassword) {
    throw new ApiError(400, "Incorrect old password")
  }
  user.password = newPassword;

  // if (!(newPassword === comfirmPassword)) {
  //   throw new ApiError(400, "Incorrect confirm password")
  // }
  await user.save({ invalideBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password changed successfully"
      )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {


  return res
    .status(200)
    .json(new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    ))
})


const updateAccountDetails = asyncHandler(async (req, res) => {
  //take data from frontend
  //find user by Id and update
  //response
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }

  const updatedUser = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    { new: true }).select("-password")
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedUser,
      "Account details updated successfully"
    ))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const updatedUserByAvatar = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar.url
    }
  }, {
    new: true
  }).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Avatar updated successfully"
    ))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cover image")
  }
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Cover image updated successfully"
    ))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage }