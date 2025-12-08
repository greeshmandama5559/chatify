import mongoose from "mongoose";

const PendingUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  Email: { type: String, required: true, lowercase: true, trim: true, index: true },
  Password: { type: String, required: true }, // hashed password
  verificationToken: { type: String, required: true },
  verificationTokenExpiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

PendingUserSchema.index({ verificationTokenExpiresAt: 1 }, { expireAfterSeconds: 0 }); 

export default mongoose.model("PendingUser", PendingUserSchema);
