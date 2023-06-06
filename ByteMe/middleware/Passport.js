require("dotenv").config();

// Passport
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Dynamically set my NODE_ENV
const serverEnvironment = process.env.NODE_ENV || "development";

let callbackURL;
if (serverEnvironment === "development") {
  callbackURL = "http://localhost:8080/googleAuth";
} else {
  callbackURL = `${process.env.SERVER_BASE_URL}/googleAuth`;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in your database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log("User with this email already exists.");
        }

        if (!user) {
          // If the user doesn't exist, create a new one
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            fName: profile.name.givenName,
            lName: profile.name.familyName,
            profileImage: profile.photos[0].value,
          });
          await user.save();
        }

        // Pass the authenticated user to the callback
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// Express
const express = require("express");
const app = express();

// User Schema
const User = require("../utils/userModel").User;

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //   User.findById(id, (err, user) => {
  //     done(err, user);
  //   });

  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
