import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { sub } = req.query;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is required");
  }

  if (sub === "true") {
    const toggleSubs = await Subscription.deleteOne({
      channel: channelId,
      subscriber: req.user?._id,
    });
    if (!toggleSubs) {
      throw new ApiError(400, "Error while unsubscribing!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, toggleSubs, "Unsubscribed successfully"));
  } else {
    const toggleSubs = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });

    if (!toggleSubs) {
      throw new ApiError(400, "Error while subscribing!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, toggleSubs, "Subscribed successfully"));
  }
});

export { toggleSubscription };