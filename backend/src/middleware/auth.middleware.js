import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ENV from "../ENV.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "unauthoried - invalid." });

    const user = await User.findById(decoded.userId).select("-Password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch (error) {
    console.error("error in middleware: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
