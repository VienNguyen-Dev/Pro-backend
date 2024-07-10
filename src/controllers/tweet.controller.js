import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required")
  }
  const owner = req.user?._id;
  const tweet = await Tweet.create({
    content,
    owner
  })

  await tweet.save();
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      tweet,
      "Tweet created successfuly"
    ))
})

const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const tweet = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      }
    },
    {
      $lookup: {
        from: "tweets",
        localField: "_id",
        foreignField: "onwer",
        as: "user",

      }
    },

    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
      }
    }

  ])

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      tweet,
      "Tweet fetched successfuly"
    ))
})

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;
  const tweet = await Tweet.findByIdAndUpdate(tweetId, {
    $set: {
      content
    }
  }, {
    new: true
  });
  if (!tweet) {
    throw new ApiError(400, "Error while updating tweet")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      tweet
    ))
})


const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Tweet deleted successfully"
    ))
})
export {
  createTweet,
  getUserTweet,
  updateTweet,
  deleteTweet
}