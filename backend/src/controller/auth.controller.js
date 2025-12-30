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
      authProvider: "local",
      verificationToken,
      verificationTokenExpiresAt,
    });

    await pending.save();

    // send verification email (best-effort)
    try {
      const mailRes = await sendVerificationEmail({
        to: Email,
        subject: "Verify Your Email",
        ver: verificationToken,
      });
      if (!mailRes.ok) {
        return res
          .status(400)
          .json({ message: "failed to send verification code." });
      }
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
      _id: PendingUser._id,
      fullName: PendingUser.fullName,
      bio: PendingUser.bio,
      profilePic: PendingUser.profilePic,
      interests: PendingUser.interests,
      isActive: PendingUser.isActive,
      likesCount: PendingUser.likesCount,
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
      isActive: savedUser.isActive,
      likesCount: savedUser.likesCount,
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

    if (user?.isPending) {
      return res.redirect(
        `${ENV.CLIENT_URL}/complete-profile?state=${user.token}`
      );
    }

    generateToken(user._id, res);

    return res.redirect(ENV.CLIENT_URL);
  } catch (error) {
    console.log("error in googlesuccess: ", error);
    return res.status(500).send("Authentication error");
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { state, fullName } = req.body;

    const pending = await PendingUser.findOne({
      verificationToken: state,
    });

    if (!pending) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const nameExists = await User.findOne({ fullName });
    if (nameExists) {
      return res.status(409).json({ message: "name already taken" });
    }

    const user = await User.create({
      googleId: pending.googleId,
      fullName,
      Email: pending.Email,
      profilePic: pending.profilePic,
      isVerified: true,
    });

    await PendingUser.deleteOne({ _id: pending._id });

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      Email: user.Email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.log("error in complete profile (backend):", error);
    res.status(400).json({
      success: false,
      message: "internal server error",
    });
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
    if (!fullName) return res.status(400).json({ message: "name is required" });

    const userId = req.user._id;

    const userExists = await User.findOne({
      fullName: fullName,
      _id: { $ne: userId },
    });

    if (userExists) {
      console.log("userExists: ", userExists);
      return res.status(400).json({ message: "UserName already exists" });
    }

    await User.findByIdAndUpdate(userId, { fullName: fullName }, { new: true });

    res.status(200).json({
      success: true,
      fullName,
    });
  } catch (error) {
    console.error("error in updating profile: ", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateActiveState = async (req, res) => {
  try {
    const { isActive } = req.body;

    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      isActive: user.isActive,
    });
  } catch (error) {
    console.log("error in active state (backend): ", error);
    res
      .status(500)
      .json({ message: "error in active state (backend): ", error });
  }
};

export const updateSeenStatus = async (req, res) => {
  try {
    const { isSeenOn } = req.body;

    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSeenOn: isSeenOn },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      isSeenOn: user.isSeenOn,
    });
  } catch (error) {
    console.log("error in active state (backend): ", error);
    res
      .status(500)
      .json({ message: "error in active state (backend): ", error });
  }
};

export const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    console.log("bio: ", bio);

    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { bio: bio },
      { new: true }
    );

    res.json({ success: true, bio: user.bio });
  } catch (err) {
    res.status(500).json({ success: false, message: `Update failed: ${err}` });
  }
};

export const updateIntrests = async (req, res) => {
  try {
    const { interests } = req.body;

    console.log("intrets: ", interests);

    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { interests: interests },
      { new: true }
    );

    res.json({ success: true, interests: user.interests });
  } catch (err) {
    res.status(500).json({ success: false, message: `Update failed: ${err}` });
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

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "no user id available" });
    }

    const selectedUser = await User.findById(userId).select("-Password");
    if (!selectedUser) {
      return res.status(400).json({ message: "user not found" });
    }

    res.status(200).json({
      success: true,
      selectedUser: selectedUser,
    });
  } catch (error) {
    console.log("error in get user by id: ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getSimilarInterestUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const currentUser = await User.findById(userId).select("interests");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.interests.length) {
      return res.status(200).json([]);
    }

    const similarUsers = await User.aggregate([
      { $match: { _id: { $ne: userId } } },

      {
        $addFields: {
          commonInterests: {
            $size: {
              $setIntersection: ["$interests", currentUser.interests],
            },
          },
          totalUniqueInterests: {
            $size: {
              $setUnion: ["$interests", currentUser.interests],
            },
          },
        },
      },
      {
        $addFields: {
          matchPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $gt: ["$totalUniqueInterests", 0] },
                      {
                        $divide: ["$commonInterests", "$totalUniqueInterests"],
                      },
                      0,
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },

      { $match: { commonInterests: { $gt: 0 } } },
      { $sort: { matchPercentage: -1 } },
    ]);

    res.status(200).json(similarUsers);
  } catch (error) {
    console.error("Similar interests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
