import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (content.trim() === "") {
    throw new ApiError(400, "Tweet content is missing!");
  }

  const tweet = await Tweet.create({
    content: content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong will creating tweet!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet successfully created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(500, "Invalid User Id!");
  }

  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(`${userId}`),
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
              avatar: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "NumLikes",
      },
    },
    {
      $addFields: {
        details: {
          $first: "$details",
        },
        likes: {
          $size: "$NumLikes",
        },
      },
    },
  ]);

  if (!userTweets.length) {
    return "No Tweets found";
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!content?.trim() === "") {
    throw new ApiError(400, "Content must be required");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(400, "Error while updating the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id!");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(400, "Error while deleting");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
