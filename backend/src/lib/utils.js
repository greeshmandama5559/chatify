import jwt from "jsonwebtoken";
import ENV from "../ENV.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;

