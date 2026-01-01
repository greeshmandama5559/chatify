import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    gender: {
      type: String,
      lowercase: true,
    },

    Password: {
      type: String,
      minlength: 6,
    },

    profilePic: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 200,
      default: "",
      trim: true,
    },

    interests: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "You can add up to 10 interests only",
      },
    },

    gallery: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      validate: [arrayLimit, "{PATH} exceeds the limit of 4"],
      default: [],
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isSeenOn: {
      type: Boolean,
      default: true,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    likes: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          likedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    hasNewNotification: {
      type: Boolean,
      default: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,

    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 4;
}

export default mongoose.model("User", userSchema);
