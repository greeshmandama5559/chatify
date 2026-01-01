import User from "../models/User.js";
import ProfileLike from "../models/ProfileLike.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinaryImage from "../lib/cloudinaryImage.js";

export const likeProfile = async (req, res) => {
  const likedUserId = req.params.userId;
  const likedBy = req.user._id;

  if (likedUserId === likedBy.toString()) {
    return res
      .status(400)
      .json({ message: "You cannot like your own profile" });
  }

  try {
    // Try to create like only if it doesn't exist
    const existingLike = await ProfileLike.findOne({
      likedBy,
      likedUser: likedUserId,
    });

    if (existingLike) {
      // already liked → idempotent success
      return res.status(200).json({ success: true });
    }

    // Create like
    await ProfileLike.create({
      likedBy,
      likedUser: likedUserId,
      hasLiked: true,
    });

    // Update user stats
    await User.findByIdAndUpdate(likedUserId, {
      $inc: { likesCount: 1 },
      $addToSet: { likes: { userId: likedBy } },
      $set: { hasNewNotification: true },
    });

    // Notify receiver
    const receiverSocketId = getReceiverSocketId(likedUserId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("profile:liked", {
        likedBy,
      });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.log("error in like profile (backend): ", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const unlikeProfile = async (req, res) => {
  const likedUserId = req.params.userId;
  const likedBy = req.user._id;

  if (likedUserId === likedBy.toString()) {
    return res.status(400).json({
      message: "You cannot unlike your own profile",
    });
  }

  try {
    const removed = await ProfileLike.findOneAndDelete({
      likedBy,
      likedUser: likedUserId,
    });

    if (!removed) {
      // already unliked → idempotent success
      return res.status(200).json({ success: true });
    }

    await User.findByIdAndUpdate(likedUserId, {
      $inc: { likesCount: -1 },
      $pull: { likes: { userId: likedBy } },
      $set: { hasNewNotification: false },
    });

    const receiverSocketId = getReceiverSocketId(likedUserId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("profile:unliked", {
        likedBy,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("error in unlike profile (backend): ", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const updatehasNewNotification = async (req, res) => {
  try {
    const { isSeen } = req.body;
    const authId = req.user._id;

    if (!authId) {
      return res.status(400).json({ messsage: "no auth id" });
    }

    const authUser = await User.findByIdAndUpdate(
      authId,
      { hasNewNotification: isSeen },
      { new: true }
    );

    if (!authUser) {
      return res.status(400).json({ message: "no user found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("error in update notification: ", error);
    return res.status(500).json({ message: "internal server errror" });
  }
};

export const getLikesCount = async (req, res) => {
  const user = await User.findById(req.params.userId).select("likesCount");
  res.json({ likesCount: user.likesCount });
};

export const getMyLikes = async (req, res) => {
  const likes = await ProfileLike.find({ likedUser: req.user._id }).populate(
    "likedBy",
    " fullName profilePic isActive likesCount gallery"
  );

  res.json(likes);
};

export const getUserByName = async (req, res) => {
  try {
    const { userName } = req.query;

    if (!userName?.trim()) {
      return res.status(400).json({ message: "Search term required" });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      fullName: {
        $regex: userName.trim(),
        $options: "i",
      },
    }).select("-password");

    console.log("users: ", users);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("error in get user by name:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const result = cloudinaryImage.uploader.upload_stream(
      { folder: "user-gallery" },
      async (error, result) => {
        if (error) throw error;

        const user = await User.findById(req.user._id);

        if (user.gallery.length >= 4) {
          return res.status(400).json({
            message: "Max 4 images allowed",
          });
        }

        user.gallery.push({
          url: result.secure_url,
          publicId: result.public_id,
        });

        await user.save();

        res.json({
          success: true,
          gallery: user.gallery,
        });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { imageId } = req.params;

    // 1️⃣ Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Find image in gallery
    const image = user.gallery.id(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // 3️⃣ Delete from Cloudinary
    if (image.publicId) {
      await cloudinaryImage.uploader.destroy(image.publicId);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      $pull: { gallery: { _id: imageId } },
    });

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      gallery: updatedUser.gallery,
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
};
