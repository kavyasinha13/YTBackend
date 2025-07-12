import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
  addCommentToTweet,
  getTweetComments,
  addReplyToComment,
  getRepliesToComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/tweet/:tweetId").post(addCommentToTweet);
router.route("/tweet/:tweetId").get(getTweetComments);
router.post("/reply/:commentId", addReplyToComment);
router.get("/replies/:commentId", getRepliesToComment);

export default router;
