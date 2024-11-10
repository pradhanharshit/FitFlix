import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (name?.trim() === "" || description?.trim() === "") {
    throw new ApiError(401, "Both the feilds are required!");
  }

  const createdPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: new mongoose.Types.ObjectId(`${req.user?._id}`),
  });

  if (!createdPlaylist) {
    throw new ApiError(501, "Error creating the playlist!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid userId");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(401, "User doesn't exists!");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(`${userId}`),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "videos",
        as: "details",
        pipeline: [
          {
            $project: {
              thumbnail: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!playlists) {
    throw new ApiError(501, "Error fetching user playlists!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playlistId!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(501, "Error fetching playlist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid playlistId or videoId!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(401, "Playlist not found!");
  }

  const videoAdded = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!videoAdded) {
    throw new ApiError(401, "Error in adding video to the playlist!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoAdded,
        "Successfully addded video to the playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid playlistId or videoId!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(401, "Playlist not found!");
  }

  const videoRemovedFromPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: {
          $in: [`${videoId}`],
        },
      },
    },

    { new: true }
  );

  if (!videoRemovedFromPlaylist) {
    throw new ApiError(401, "Error removing video from playlist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoRemovedFromPlaylist, "Success"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playlistId!");
  }
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(401, "Atleast one the field is required!");
  }

  if (name?.trim() === "" || description?.trim() === "") {
    throw new ApiError(401, "Name or description can't be empty!");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(401, "Error while updating the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playlistId!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Couldn't find the playlist!");
  }

  const deletedPlaylist = await Playlist.findOneAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(500, "Error in deleting the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
