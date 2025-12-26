import mongoose from "mongoose";

const profileLikeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hasLiked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate likes
 * Same user cannot like the same profile twice
 */
profileLikeSchema.index({ likedBy: 1, likedUser: 1 }, { unique: true });

export default mongoose.model("ProfileLike", profileLikeSchema);
