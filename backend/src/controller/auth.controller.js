import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import ENV from "../ENV.js";
import cloudinary from "../lib/cloudinary.js";
import { generateStreamToken } from "../lib/stream.js";
import crypto from "crypto";
import PendingUser from "../models/PendingUser.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordRestSuccess,
  sendPasswordResetEmail,
} from "../emails/sendEmail.js";

//--------------------signup-----------------------------------------------
export const signup = async (req, res) => {
  const { fullName, Email, Password } = req.body;

  try {
    if (!fullName || !Email || !Password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (Password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (fullName.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Name must contain at least 3 letters" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login" });
    }

    const existingUserName = await User.findOne({ fullName });
    if (existingUserName) {
      return res.status(400).json({
        message: "User name already exists, Please try different one",
      });
    }

    // If a pending user already exists, remove it (or update) — here we remove and create a fresh one
    await PendingUser.deleteOne({ Email });

    const updatedFullName = fullName.trim().replace(/\s+/g, " ");

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(Password, salt);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // 6-digit OTP
    const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const pending = new PendingUser({
      fullName: updatedFullName,
      Email,
      Password: hashed,
      verificationToken,
      verificationTokenExpiresAt,
    });

    await pending.save();

    // send verification email (best-effort)
    try {
      await sendVerificationEmail({
        to: Email,
        subject: "Verify Your Email",
        ver: verificationToken,
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return res
        .status(400)
        .json({ message: "Failed to send verification email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete signup.",
      Email,
    });
  } catch (error) {
    console.error("error occurred while signup:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

//--------------------verifyEmail-----------------------------------------------
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  try {
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const pending = await PendingUser.findOne({
      verificationToken: otp,
      verificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!pending) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ Email: pending.Email });
    if (existingUser) {
      await PendingUser.deleteOne({ Email: pending.Email });
      return res
        .status(400)
        .json({ message: "User already exists. Please login." });
    }

    const user = new User({
      fullName: pending.fullName,
      Email: pending.Email,
      Password: pending.Password,
      isVerified: true,
    });

    const savedUser = await user.save();

    await PendingUser.deleteOne({ Email: pending.Email });

    try {
      await sendWelcomeEmail({
        to: savedUser.Email,
        subject: "Welcome! Your email is verified",
        name: savedUser.fullName,
        url: ENV.CLIENT_URL,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

    generateToken(savedUser._id, res);

    const userObj = {
      _id: savedUser._id,
      fullName: savedUser.fullName,
      Email: savedUser.Email,
      profilePic: savedUser.profilePic,
      isVerified: savedUser.isVerified,
    };

    return res.status(200).json(userObj);
  } catch (error) {
    console.error("error in verifyEmail controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//--------------------resendOtp-----------------------------------------------
export const resendOtp = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email) return res.status(400).json({ message: "Email required" });

    const pending = await PendingUser.findOne({ Email });
    if (!pending)
      return res
        .status(404)
        .json({ message: "No pending signup found for this email" });

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    pending.verificationToken = verificationToken;
    pending.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await pending.save();

    try {
      await sendVerificationEmail({
        to: Email,
        subject: "Your verification code",
        ver: verificationToken,
      });
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Try again later." });
    }

    return res.status(200).json({ success: true, message: "OTP resent" });
  } catch (err) {
    console.error("resendOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password Are Required" });
  }

  try {
    const user = await User.findOne({ Email });
    if (!user)
      return res
        .status(400)
        .json({ message: "email doesnt exist, please sign up" });

    const isPasswordCorrect = await bcrypt.compare(Password, user.Password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      Email: user.Email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("error in login controller ", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "internal server error" });
    }
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    if (!Email) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ Email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email dosn`t exist, please signup" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail({
      to: Email,
      subject: "Password Reset Request",
      resetToken: resetToken,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("error in updating password: ", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { Password } = req.body;

    console.log("password: ", Password, "token: ", token);

    if (!token || !Password) {
      console.log("Token or Password missing");
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    if (typeof Password !== "string" || Password.trim().length < 6) {
      return res.status(400).json({
        message: "Password must be a string of at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(Password.trim(), salt);

    user.Password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    try {
      await sendPasswordRestSuccess({
        to: user.Email,
        subject: "Password Reset Successful",
      });
    } catch (emailErr) {
      console.error("Failed to send password-reset-success email:", emailErr);
    }

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("error in reset password: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const googleSuccess = async (req, res) => {
  try {
    let user = req.user;

    if (!user.googleId) {
      const found = await User.findById(user._id);
      if (found && !found.googleId) {
        found.googleId = user.googleId || req.user.googleId;
        await found.save();
        user = found;
      }
    }

    const token = generateToken(user._id, res);

    console.log("googleSuccess token:", token, "user: ",user._id);

    res.redirect(`${ENV.CLIENT_URL}/google-success?token=${token}`);
  } catch (error) {
    console.log("error in googlesuccess: ", error);
    return res.status(500).send("Authentication error");
  }
};

export const logout = async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "logout successful" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "profile is required" });

    const userId = req.user._id;

    // cloudinary should be the cloudinary instance exported from lib/cloudinary.js
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("error in updating profile: ", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateProfileName = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName)
      return res.status(400).json({ message: "name is required" });

    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName: fullName },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("error in updating profile: ", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export async function getStreamToken(req, res) {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      return res.status(400).json({ message: "User id not found on request" });
    }

    const token = generateStreamToken(userId);

    if (!token) {
      console.error(
        "generateStreamToken returned empty token for user:",
        userId
      );
      return res.status(500).json({ message: "Failed to generate token" });
    }

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error?.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: "User id is required" });

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error in delete user: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
