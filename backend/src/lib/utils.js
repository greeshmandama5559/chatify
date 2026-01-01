import jwt from "jsonwebtoken";
import ENV from "../ENV.js";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // in MS (7days)
    httpOnly: true,
    secure: ENV.NODE_ENV === "production", // true in prod, requires https
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  });

  return token;
};

export default generateToken;
