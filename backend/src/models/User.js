import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      unique: true,
      trim: true,
    },

    Password: {
      type: String,
      minlength: 6,
      select: false,
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

    likesCount: {
      type: Number,
      default: 0,
    },

    hasNewNotification: {
      type: Boolean,
      default: false
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,

    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
