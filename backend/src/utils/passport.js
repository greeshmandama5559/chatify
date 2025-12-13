import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import crypto from "crypto";
import ENV from "../ENV.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: `${ENV.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails?.[0]?.value;

        if (!email) return done(new Error("No email from Google"));

        let user = await User.findOne({ googleId: id });
        if (user) return done(null, user);

        user = await User.findOne({ Email: email });
        if (user) {
          user.googleId = id;
          await user.save();
          return done(null, user);
        }

        const fullNameExists = await User.findOne({ fullName: displayName });

        if (fullNameExists) {
          const token = crypto.randomBytes(32).toString("hex");

          const pendingUser = await PendingUser.create({
            googleId: id,
            fullName: displayName,
            Email: email,
            profilePic: photos[0]?.value,
            authProvider: "google",
            verificationToken: token,
          });

          return done(null, {
            pendingUserId: pendingUser._id,
            isPending: true,
            token,
          });
        }

        user = await User.create({
          googleId: id,
          fullName: displayName,
          Email: email,
          profilePic: photos[0]?.value,
          isVerified: true,
        });

        return done(null, user);
      } catch (err) {
        console.error("GoogleStrategy error:", err);
        return done(err);
      }
    }
  )
);
