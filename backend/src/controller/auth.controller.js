import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import sendWelcomeEmail from "../emails/emailHandler.js";
import ENV from "../ENV.js";

export const signup = async (req, res) => {
  const { fullName, Email, Password } = req.body;
  try {
    if (!fullName || !Email || !Password) {
      return res.status(400).json({ message: "All Fiels Are Required" });
    }

    if (Password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must contain atleast 6 characters" });
    }

    if (fullName.length < 3) {
      return res
        .status(400)
        .json({ message: "name must contain atleast 3 letters" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await User.findOne({ Email });
    if (user) return res.status(400).json({ message: "User already exits." });

    const salt = await bcrypt.genSalt(12);
    const hashedSalt = await bcrypt.hash(Password, salt);

    const newUSer = new User({
      fullName,
      Email,
      Password: hashedSalt,
    });

    if (newUSer) {
      const savedUser = await newUSer.save();
      generateToken(newUSer._id, res);

      res.status(201).json({
        _id: savedUser._id,
        fullName: savedUser.fullName,
        Email: savedUser.Email,
        profilePic: savedUser.profilePic,
      });

      try {
        await sendWelcomeEmail(
          savedUser.fullName,
          savedUser.Email,
          ENV.CLIENT_URL
        );
      } catch (error) {
        console.error("failed to send welcome email: ");
      }
    } else {
      res.status(400).json({ message: "invalid data" });
    }
  } catch (error) {
    console.log("error occured while singin" + error);
    res
      .status(500)
      .json({ message: "something went wrong please try again later" });
  }
};

export const login = async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
      return res.status(400).json({ message: "Email and Password Are Required" });
    }

  try {
    const user = await User.findOne({ Email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isPasswordCorrect = await bcrypt.compare(Password, user.Password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      Email: user.Email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("error in login controller "+error);
    res.status(500).json({message:"internal server error"});
  }
};

export const logout = async (_, res) => {
    res.cookie("jwt", "", {maxAge:0});
    res.status(200).json({message:"logout successfull"});
};
