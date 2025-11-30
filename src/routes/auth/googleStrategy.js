const GoogleStrategy = require("passport-google-oauth20").Strategy;
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = require("../../config");
const User = require("../../models/User");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0] && profile.emails[0].value;
          const googleId = profile.id;
          const name =
            profile.displayName ||
            (profile.name &&
              `${profile.name.givenName} ${profile.name.familyName}`) ||
            "No name";

          if (!email) return done(new Error("No email returned from Google"));

          // first try find by googleId
          let user = await User.findOne({ googleId });
          if (user) return done(null, user);

          // then try find by email
          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            // link googleId to existing user
            user.googleId = googleId;
            await user.save();
            return done(null, user);
          }

          // create new user
          const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            googleId,
          });
          return done(null, newUser);
        } catch (err) {
          console.error("Google strategy error", err);
          return done(err, null);
        }
      }
    )
  );
};
