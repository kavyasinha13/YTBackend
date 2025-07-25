import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addToWatchHistory,
  addToWatchLater,
  removeFromWatchLater,
  getWatchLater,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getChannelVideos,
  getChannelStats,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/allVideos/:username").get(verifyJWT, getChannelVideos);
router.route("/stats/:username").get(verifyJWT, getChannelStats);
router.route("/history/:videoId").post(verifyJWT, addToWatchHistory);
router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/watchLater/:videoId").post(verifyJWT, addToWatchLater);
router.route("/watchLater/:videoId").delete(verifyJWT, removeFromWatchLater);
router.route("/watchLater").get(verifyJWT, getWatchLater);

export default router;
