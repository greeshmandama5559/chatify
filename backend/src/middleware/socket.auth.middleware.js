import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ENV from "../ENV.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized - No Token"));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.error("Socket connection rejected - Invalid Token");
      return next(new Error("Unauthorised - Invalid Token"));
    }

    const user = await User.findById(decoded.userId).select("-Password");
    if (!user) {
      console.error("Socket connection rejected - User Not Found");
      return next(new Error("User Not Found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    console.log(
      ` Socket Authenticated For User: ${user.fullName} (${user._id})`
    );

    next();
  } catch (error) {
    console.error("Error in socket auth: " + error);
    return next(new Error("Authentication Failed"));
  }
};
