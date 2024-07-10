import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  if (!content) {
    throw new ApiError(400, "Content is required")
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not exist");
  }

  const onwer = req.user?._id;
  const newComment = await Comment({
    content,
    video: videoId,
    onwer,
  })

  await newComment.save();

  return res
    .status(201)
    .json(new ApiResponse(
      200,
      newComment,
      "Comment added successfully"
    ))

})

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { limit = 10, page = 1 } = req.query;


  const comments = await Comment.find({ video: videoId }).limit(limit);
  if (!comments) {
    throw new ApiError(404, "Video have no any comments");
  }
  const totalComments = await Comment.countDocuments({ video: videoId })
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {
        results: comments,
        pagination: {
          page,
          pages: parseInt(Math.ceil(totalComments / limit)),
          totalComments
        }
      },
      "Comments fetched successfully"
    ))
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const updatedComment = await Comment.findByIdAndUpdate({
    _id: commentId,

  }, {
    $set: {
      content

    }
  },
    {
      new: true
    })

  if (!updateComment) {
    throw new ApiError(400, "Error while updating comment for video")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedComment,
      "Comment updated successfully"
    ))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  await Comment.findByIdAndDelete({
    _id: commentId,

  })

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Comment deleted successfully"
    ))
})


export {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment
}