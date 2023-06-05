// Passport
const passport = require("passport");

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
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
