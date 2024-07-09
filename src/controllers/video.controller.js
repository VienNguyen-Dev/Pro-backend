import mongoose, { now } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "asc", userId } = req.query;
  //Todo: get all video based sortBy, sortType, pagination
  // kiem tra xem nguoi dung co phai danh tim kiem theo title hay khong?
  //Tao ra mot doi tuongrong de luu tru cac gia tri can truy van nay;

  let filters = {};

  if (query) {
    filters.title = {
      $regex: query, $options: "i"
    }
  }
  //Kiem tra co dung user dang truy van hay khong?
  if (userId) {
    filters.userId = userId;
  }

  const skip = (page - 1) * limit;

  const options = {
    limit: parseInt(limit),
    skip: parseInt(skip)
  }
  let sort = {};
  sort[sortBy] = sortType === "desc" ? 1 : -1;

  const aggregate = await Video.aggregate([
    {
      $match: filters,

    }, {
      $sort: sort
    }
  ])
  const videos = await Video.aggregatePaginate(aggregate, options);

  if (!videos) {
    throw new ApiError(404, "Video not found");
  }
  // const totals = await Video.countDocuments(filters);
  // const pages = Math.ceil(totals / limit);

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      [

        { data: videos.docs },
        {
          pagination: {
            currentPage: videos.page,
            totalsPages: videos.totalPages,

          }
        }
      ],
      "All videos fetched successfully"
    ))
})

const publishAVideo = asyncHandler(async (req, res) => {
  //take value from frontend
  //get video file 
  //upload video on cloundinary
  //create Video 
  const { title, description } = req.body;

  //check valid
  if (!title && !description) {
    throw new ApiError("Title or description is required")
  }
  const videoLocalPath = req.files?.videoFile[0]?.path; //lay duong dan cua video file tu mang files 
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required")
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required")
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const duration = videoFile.duration;


  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration,
    title,
    description,
    isPublished: true,
    view: 0
  })
  await video.save();
  return res
    .status(201)
    .json(new ApiResponse(
      200,
      video,
      "Video published successfully"
    ))
})


//Take videoId from frontend
// search video 
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      video,
      "Video fetched successfully"
    ))
})


const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;


  const thumbnailLocalPath = req.file?.path;


  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is missing")
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const video = await Video.findByIdAndUpdate(videoId, {
    $set: {
      title,
      description,
      thumbnail: thumbnail.url,


    }
  },
    { new: true });
  if (!video) {
    throw new ApiError(400, "Error while updating video")
  }
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updateVideo,
      "Video updated successfully"
    ))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(400, "Error while deleting video")
  }
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Video deleted successfully"
    ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById({ _id: videoId });
  if (!video) {
    throw new ApiError(404, "Video not found")
  }
  video.isPublished = !video.isPublished;
  const updatedVideo = await video.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      updatedVideo,
      "Toggle published successfully"
    ))
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }
