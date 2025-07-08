import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userId = user._id;

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        subscriberCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const video = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        totalLikes: {
          $size: "$likes",
        },
        totalViews: "$views",
        totalVideo: 1,
      }, //count likes and views for each video
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: "$totalLikes",
        },
        totalViews: {
          $sum: "$totalViews",
        },
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ]);

  const channelStats = {
    totalSubscribers: totalSubscribers[0]?.subscriberCount || 0,
    totalLikes: video[0]?.totalLikes || 0,
    totalViews: video[0]?.totalViews || 0,
    totalVideos: video[0]?.totalVideos || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "channel stats fetched successfully")
    );
});

// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userId = user._id;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        createdAt: {
          $dateToParts: { date: "$createdAt" },
        },
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        createdAt: {
          year: 1,
          month: 1,
          day: 1,
        },
        isPublished: 1,
        likesCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "channel stats fetched successfully"));
});

export { getChannelStats, getChannelVideos };
