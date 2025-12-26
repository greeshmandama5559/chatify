import rateLimit from "express-rate-limit";

export const likeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many like requests. Try again later.",
});