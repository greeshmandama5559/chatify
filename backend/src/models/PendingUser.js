import mongoose from "mongoose";

const PendingUserSchema = new mongoose.Schema({
  googleId: String,

  fullName: { type: String, required: true, trim: true },

  Password: {
    type: String,
    minlength: 6,
  },

  profilePic: String,

  authProvider: {
    type: String,
    enum: ["google", "local"],
    required: true,
  },

  verificationToken: { type: String, required: true },
  verificationTokenExpiresAt: { type: Date},

  createdAt: { type: Date, default: Date.now },
});

PendingUserSchema.index(
  { verificationTokenExpiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("PendingUser", PendingUserSchema);
