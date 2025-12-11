import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";
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
        if (!email) return done(new Error("No email from Google"), null);

        let user = await User.findOne({ googleId: id });

        if (!user) {
          user = await User.findOne({ Email: email });

          if (user) {
            user.googleId = id;
            await user.save();
          } else {
            user = await User.create({
              googleId: id,
              fullName: displayName,
              Email: emails[0].value,
              profilePic: photos[0].value,
              isVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error("GoogleStrategy error:", error);
        return done(error, null);
      }
    }
  )
);
