import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//1. Tim kiem va update like theo commentId
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.parmas;
  const userLikeId = req.user?._id;
  const likeExisting = await Like.findOne({
    comment: commentId,
    likeBy: userLikeId
  })

  //neu user da like
  if (likeExisting) {
    await Like.findByIdAndDelete(likeExisting._id);
  }
  //Neu chua ton tai thi them vao mang like
  const newLike = await Like.create({
    comment: commentId,
    likeBy: userLikeId
  })

  await newLike.save();
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      newLike,
      "Comment Like toggled successfully"
    ))
})

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userLikeId = req.user?._id;

  const likeExisting = await Like.findOne({
    video: videoId,
    likeBy: userLikeId
  })
  if (likeExisting) {
    await Like.findByIdAndDelete(likeExisting._id);
  }
  const newLike = await Like.create({
    video: videoId,
    likeBy: userLikeId
  })

  await newLike.save();

  return res
    .status(201)
    .json(new ApiResponse(
      200,
      newLike,
      "Like toggled successfully"
    ))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userLikeId = req.user?._id;

  const likeExisting = await Like.findOne({
    tweet: tweetId,
    likeBy: userLikeId
  })

  if (likeExisting) {
    await Like.findByIdAndDelete(likeExisting._id);
  }

  const newLike = await Like.create({
    tweet: tweetId,
    likeBy: userLikeId
  })

  await newLike.save();
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      newLike,
      "Tweet like toggled successfully"
    ))
})
//take all video liked of user
const getLikedVideo = asyncHandler(async (req, res) => {
  const userLikeId = req.user?._id;
  const userLike = await Like.findOne({
    likeBy: userLikeId
  })

  if (!userLike) {
    throw new ApiError(404, "User no liked video")
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likeBy: new mongoose.Types.ObjectId(req.user?._id),
        video: {
          $exists: true
        }
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",

      }
    },
    {
      $unwind: "$videoDetails"
    },
    { $replaceRoot: { newRoot: '$videoDetails' } }
  ])
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      likedVideos,
      "Like video fetched successfully"
    ))
})
export { toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideo }