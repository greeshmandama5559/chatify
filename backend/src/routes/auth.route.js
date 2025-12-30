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
  googleSuccess,
  updateProfileName,
  completeProfile,
  updateBio,
  updateIntrests,
  updateActiveState,
  getUserById,
  getSimilarInterestUsers,
  updateSeenStatus,
} from "../controller/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import passport from "passport";

const route = express.Router();

route.post("/complete-profile", completeProfile);

route.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/signup" }),
  googleSuccess
);

route.use(arcjetProtection);

route.get("/test", (req, res) => {
  res.status(200).json({
    message: "test route",
  });
});

route.post("/signup", signup);

route.post("/verify-email", verifyEmail);

route.post("/resend-otp", resendOtp);

route.post("/login", login);

route.post("/forgot-password", forgotPassword);

route.post("/reset-password/:token", resetPassword);

route.post("/logout", logout);

route.put("/update-profile", protectedRoute, updateProfile);

route.put("/update-profile-name", protectedRoute, updateProfileName);

route.put("/update-bio", protectedRoute, updateBio);

route.put("/update-intrests", protectedRoute, updateIntrests);

route.put("/update-active-status", protectedRoute ,updateActiveState);

route.put("/update-seen-status", protectedRoute ,updateSeenStatus);

route.get("/stream-token", protectedRoute, getStreamToken);

route.get("/similar-interests", protectedRoute, getSimilarInterestUsers);

route.get("/check", protectedRoute, (req, res) => {
  return res.status(200).json(req.user);
});

route.delete("/delete-user/:id", deleteUser);

route.get("/find-user/:userId", getUserById);

export default route;
