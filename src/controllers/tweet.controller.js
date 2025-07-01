

import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// create tweet
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user?._id,
    })

    if(!tweet){
        throw new ApiError(500,"failed to create tweet please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"))
    
});

 // update tweet
const updateTweet = asyncHandler(async (req, res) => {
   const {content} = req.body;
   const {tweetId}= req.params;

   if(!content){
    throw new ApiError(400,"content is required")
   }

   if(!isValidObjectId(tweetId)){
    throw new ApiError(400,"invalid tweetId");
   }

   const tweet = await Tweet.findById(tweetId)

   if(!tweet){
    throw new ApiError(404,"tweet not found")
   }

   if(tweet?.owner.toString()!== req.user?._id.toString()){
     throw new ApiError(400,"only owner can edit tweet")
   }

   const newTweet= await Tweet.findByIdAndUpdate(tweet,
    {
        $set:{
            content,
        },
    },
    { new : true}
   );

   if(!newTweet){
    throw new ApiError(500,"failed to edit please try again")
   }

   return res
   .status(200)
   .json(new ApiResponse(200,newTweet,"tweet updated successfully"))
   
});

// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}= req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweetId")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(402,"tweet not found")
    }

    if(tweet?.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"only owner can delete tweets")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200, {tweetId}, "tweet deleted successfully"))
})


//  get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}= req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid tweetId")
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            "avatar.url":1,
                        },
                    },
                ],
            },
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likeDetails",
                pipeline:[
                    {
                        $project:{
                            likedBy:1
                        },
                    },
                ],
            },
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likeDetails",
                },
                ownerDetails:{
                    $first:"$ownerDetails"
                },
                isLiked: {
          $in: [req.user?._id, { $map: { input: "$likeDetails", as: "like", in: "$$like.likedBy" } }],
        },
            },
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                content:1,
                ownerDetails:1,
                likesCount:1,
                createdAt:1,
                isLiked:1
            },
        },
    ]);

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"))

    
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
