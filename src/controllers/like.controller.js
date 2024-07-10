import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//1. Tim kiem va update like theo commentId
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.parmas;
  const userLikeId = req.user?._id;
  const likes = await Like.findOne({
    comment: commentId,
    likeBy: userLikeId
  })

  likes.likeBy = !userLikeId;
  likes.comment = !commentId;

  await likes.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      likes,
      "Comment Like toggled successfully"
    ))






})