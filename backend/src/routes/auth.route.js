import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  forgotPassword,
  getStreamToken,
  verifyEmail,
  resetPassword,
  deleteUser,
  resendOtp,
} from "../controller/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const route = express.Router();

route.use(arcjetProtection);

route.get("/test", (req, res) => {
  res.status(200).json({
    message: "test route",
  });
});

route.post("/signup", signup);

route.post("/verify-email", verifyEmail);

route.post("/resend-otp", resendOtp)

route.post("/login", login);

route.post("/forgot-password", forgotPassword);

route.post("/reset-password/:token", resetPassword);

route.post("/logout", logout);

route.put("/update-profile", protectedRoute, updateProfile);

route.get("/stream-token", protectedRoute, getStreamToken);

route.get("/check", protectedRoute, (req, res) => {
  return res.status(200).json(req.user);
});

route.delete("/delete-user/:id", deleteUser);

export default route;
