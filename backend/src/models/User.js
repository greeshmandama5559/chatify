import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      require: true,
      unique: true,
    },
    fullName: {
      type: String,
      require: true,
    },
    Password: {
      type: String,
      require: true,
      minLenght: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    googleId: {
      type:String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
); // addedAt and updatedAt

const User = mongoose.model("User", userSchema);

export default User;
