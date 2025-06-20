import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {Video} from "../models/video.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

   const video = await Video.findById(videoId);

   if(!video){
    throw new ApiError(404,"Video not found")
   }

  const commentAggregate = Comment.aggregate([
    {
        $match:{
            video: new mongoose.Types.ObjectId(videoId)
        } //matches with a specific video whose Id is mentioned here
    },
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField: "_id",
            as:"owner",
        } //to  find out which user has commented the given comment
    },
    {
        $lookup:{
            from: "likes",
            localField:"_id",
            foreignField:"comment"  ,
            as:"likes" ,   
        } // to find out which user has liked that comment
    },
    {
        $addFields:{
            likesCount:{
                $size: "$likes"
            },
            owner:{
                $first: "$owner"
            },
            isLiked:{
                $cond:{
                    if:{ $in : [req.user?.indexOf, "$likes.likedBy"]},
                    then: true,
                    else:false,
                }//check if the user has liked the comment
            }
        }
    },{
        $sort:{
            createdAt: -1
        }
    },
    {
        $project:{
            content:1,
            createdAt:1,
            likesCount:1,
            owner:{
                username:1,
                fullName:1,
                "avatar.url":1
            },
            isLiked:1
        }
    }
  ]);

  const options= {
    page:parseInt(page,10),
    limit:parseInt(limit,10)
};

const comments = await Comment.aggregatePaginate(
    commentAggregate,
    options
);

return res
.status(200)
.json(new ApiResponse( 200, comments, "Comments fetched successfully"))

});

//add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(404, "Content is required");
    }

    const video = await Comment.findById(videoId);
    
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    const comment= await Comment.create({
        content,
        video: videoId,
        owner:req.user?._id
    });

    if(!comment){
        throw new ApiError(500, "Failed to add comment please try again")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"))
});

// update a comment
const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(400, "content is required")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(400, "comment not found");
    }

    if(comment?.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set:{
                content
            }
        },
        {new:true}
    );

    if(!updatedComment){
        throw new ApiError(500," failed to edit comment , please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment edited successfully"))
})

// delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

     if(comment?.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(400, "only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({
    comment: commentId,
    likedBy: req.user
    });

 return res
.status(200)
.json(
    new ApiResponse(200, { commentId }, "Comment deleted successfully")
    );

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }