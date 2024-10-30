import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  let getAllVideo;
  try {
    getAllVideo = await Video.aggregate([
      {
        $sample: {
          size: parseInt(limit),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "details",
          pipeline: [
            {
              $project: {
                fullname: 1,
                avatar: 1,
                username: 1,
              },
            },
          ],
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching Videos!!");
  }

  const result = await Video.aggregatePaginate(getAllVideo, { page, limit });

  if (result.docs.length == 0) {
    return res.status(200).json(new ApiResponse(200, [], "No Videos Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result.docs, "Videos fetched successfully!"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  if (
    [title, description, thumbnailLocalPath, videoFileLocalPath].some(
      (field) => field?.trim() == ""
    )
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail link is required");
  }

  if (!videoFile) {
    throw new ApiError(400, "Videofile link is required");
  }

  const video = await Video.create({
    videoFile: videoFile.secure_url,
    thumbnail: thumbnail.secure_url,
    title,
    description,
    duration: videoFile.duration,
    isPublished: true,
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while uploading the video.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video with this id doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!"));
});

export { getAllVideos, publishVideo, getVideoById };
