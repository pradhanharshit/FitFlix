import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export { getAllVideos };
