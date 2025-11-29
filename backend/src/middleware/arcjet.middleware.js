import { isSpoofedBot } from "@arcjet/inspect";
import { aj } from "../lib/archet.js";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 5 });
    // console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too Many Requests, please try later" });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "No bots allowed" });
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({
        error: "spoofed bot detected",
        message: "malicious bot activity detected",
      });
    }

    // only call next if we didn't send a response
    next();
  } catch (error) {
    console.error("error in arcjet middleware " + error);
    next();
  }
};
