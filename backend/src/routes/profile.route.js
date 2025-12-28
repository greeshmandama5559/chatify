import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { likeLimiter } from "../middleware/rateLimit.js";
import { upload } from "../lib/multer.js";
import {
  likeProfile,
  unlikeProfile,
  getLikesCount,
  getMyLikes,
  getUserByName,
  updatehasNewNotification,
  uploadImage,
  deleteImage,
} from "../controller/profileLike.controller.js";
import ProfileLike from "../models/ProfileLike.js";
import User from "../models/User.js";

const profile = express.Router();

profile.use(arcjetProtection, protectedRoute);

profile.get("/likes/me", likeLimiter, getMyLikes);

profile.get("/search-user", getUserByName);

profile.put("/seen-notification", updatehasNewNotification);

profile.put("/upload-image", upload.single("image"), uploadImage);

profile.delete("/delete-image/:imageId", deleteImage);

profile.get("/:userId/likes-count", getLikesCount);

profile.post("/:userId/like", likeProfile);

profile.delete("/:userId/unlike", likeLimiter, unlikeProfile);

profile.get("/:userId/check", async (req, res) => {
  const myId = req.user._id;
  const selectedUser = req.params.userId;

  if (!selectedUser) {
    console.log("selected user not fonund");
    return res.status(400).json({ message: "Invalid userId" });
  }

  const isSelectedUser = await User.findById(selectedUser);
  if (!isSelectedUser) {
    console.log("selected user not found");
    return res.status(400);
  }

  const isMyId = await User.findById(myId);
  if (!isMyId) {
    console.log("user not found");
    return res.status(400);
  }

  const likeDoc = await ProfileLike.findOne({
    likedBy: myId,
    likedUser: selectedUser,
  });

  return res.status(200).json({
    hasLiked: !!likeDoc,
  });
});

export default profile;
