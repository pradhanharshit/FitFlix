import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (Model, resourceId, userId) => {
  if (!isValidObjectId(resourceId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid resourceId or videoId");
  }

  const model = Model.modelName;

  const isLiked = await Like.findOne({
    [model.toLowerCase()]: resourceId,
    likedBy: userId,
  });

  let toggledLike;
  try {
    if (!isLiked) {
      toggleLike = await Like.create({
        [model.toLowerCase()]: resourceId,
        likedBy: userId,
      });
    } else {
      toggleLike = await Like.deleteOne({
        [model.toLowerCase()]: resourceId,
        likedBy: userId,
      });
    }
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in toggling like!"
    );
  }

  const totalLikes = await Like.countDocuments({
    [model.toLowerCase()]: resourceId,
    likedBy: userId,
  });

  return { toggledLike, isLiked, totalLikes };
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const { isLiked, totalLikes } = await toggleLike(
    Video,
    videoId,
    req.user?._id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalLikes },
        !isLiked ? "Liked Successfully" : "Like removed successfully"
      )
    );
});

export { toggleVideoLike };
