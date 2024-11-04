import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

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
      toggledLike = await Like.create({
        [model.toLowerCase()]: resourceId,
        likedBy: userId,
      });
    } else {
      toggledLike = await Like.deleteOne({
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
        !isLiked
          ? "Video liked Successfully"
          : "Like from video removed successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const { commetLiked, isLiked, totalLikes } = await toggleLike(
    Comment,
    commentId,
    req.user?._id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalLikes },
        !isLiked
          ? "Comment liked Successfully"
          : "Like from comment removed successfully"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const { tweetLiked, isLiked, totalLikes } = await toggleLike(
    Tweet,
    tweetId,
    req.user?._id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalLikes },
        !isLiked
          ? "Tweet liked Successfully"
          : "Like from tweet removed successfully"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid uiserId");
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        $and: [
          {
            likedBy: new mongoose.Types.ObjectId(`${userId}`),
          },
          {
            video: {
              $exists: true,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        details: {
          $first: "$video",
        },
      },
    },
  ]);

  if (!likedVideos) {
    throw new ApiError(500, "Error fetching likedVideos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Successfully fetched liked videos!")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
