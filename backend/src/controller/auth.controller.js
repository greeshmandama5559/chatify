import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import ENV from "../ENV.js";
import cloudinary from "../lib/cloudinary.js";
import { generateStreamToken } from "../lib/stream.js";
import crypto from "crypto";
import PendingUser from "../models/PendingUser.js";
import {
  sendPasswordRestSuccess,
  sendPasswordResetEmail,
} from "../emails/sendEmail.js";

//--------------------signup-----------------------------------------------
export const signup = async (req, res) => {
  const { fullName, Password } = req.body;

  try {
    if (!fullName || !Password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedFullName = fullName.trim().replace(/\s+/g, " ");

    if (updatedFullName.length < 3) {
      return res
        .status(400)
        .json({ message: "Name must contain at least 3 letters" });
    }

    if (Password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ fullName: updatedFullName });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "UserName already exists. Try a different name." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const user = new User({
      fullName: updatedFullName,
      Password: hashedPassword,
      authProvider: "local",
      isVerified: true, // since no email verification
      profileCompleted: false,
    });

    const savedUser = await user.save();

    const token = generateToken(user._id);

    const userData = await User.findById(savedUser._id).select("-Password");

    res.status(201).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const login = async (req, res) => {
  const { fullName, Password } = req.body;

  if (!fullName || !Password) {
    return res
      .status(400)
      .json({ message: "Full name and password are required" });
  }

  try {
    const user = await User.findOne({ fullName: fullName.trim() });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        fullName: true,
        message: "UserName does not exist. Please sign up.",
      });
    }

    const isPasswordCorrect = bcrypt.compare(Password, user.Password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ Password: true, message: "Invalid Password" });
    }

    const token = generateToken(user._id);

    const userData = await User.findById(user._id).select("-Password");

    res.status(201).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { profilePic, gender, fullName } = req.body;
    const userId = req.user._id;

    let updateData = { gender };

    updateData.profileCompleted = true;

    if (fullName) updateData.fullName = fullName;

    if (profilePic.includes("/")) {
      updateData.profilePic = profilePic;
    } else if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Complete profile error:", error);
    return res.status(500).json({ message: "Profile update failed" });
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

// export const logout = async (_, res) => {
//   res.cookie("jwt", "", { maxAge: 0 });
//   res.status(200).json({ message: "logout successful" });
// };

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "profile is required" });

    const userId = req.user._id;

    const updatedData = {};

    if (profilePic.includes("/")) {
      updatedData.profilePic = profilePic;
    } else {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updatedData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-Password");

    res.status(200).json({ profilePic: updatedUser.profilePic });
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
