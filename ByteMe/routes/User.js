const express = require("express");
const router = express.Router();

const Post = require("../utils/userModel").Post;
const User = require("../utils/userModel").User;

const mongoose = require("mongoose");
const passport = require("passport");

// Route handles logging in
router.post("/logIn", (req, res) => {
  console.log("Sign in requested.");
  console.log(req.body);
  const username = req.body.username;
  const user = new User({
    username: username,
    password: req.body.password,
  });

  // console.log(user + 'USER ID');

  req.login(user, function (err) {
    if (err) {
      console.log("ERROR HERE" + err);
    } else {
      passport.authenticate("local")(req, res, function () {
        // Authenticated.
        User.findOne({ username: username }).then(function (user) {
          if (!user) {
            console.log("ERROR NO USER FOUND");
          } else {
            console.log(
              "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! USER HEREEEEE" +
                user
            );
            req.session.save(() => {
              res.status(200).json({
                message: "Login successful",
                user: user,
                sessionId: req.session.id,
              });
              console.log("User Logged in");
              // console.log(user);
            });
          }
        });
      });
    }
  });
});

// Route handles signing up
router.post("/signUp", (req, res) => {
  // console.log('Sign up requested.')
  console.log(req.body);

  const _username = req.body.username.toLowerCase();
  const _fName = req.body.fName.toLowerCase();
  const _lName = req.body.lName.toLowerCase();
  const _email = req.body.email.toLowerCase();

  console.log(_email);
  // console.log(_email);
  User.find({ email: _email }).then(function (user) {
    // console.log(user);
    if (user.length != 0) {
      res.status(400).send("User with that email already exists.");
      // res.end();
    } else {
      User.register(
        { username: _username, email: _email, fName: _fName, lName: _lName },
        req.body.password,
        function (err, user) {
          if (err) {
            // Show err message to client
            res
              .status(400)
              .send("This is where the error is coming from " + err.message);
          } else {
            passport.authenticate("local")(req, res, function () {
              // SUCCESS
              req.session.save(() => {
                res.status(200).json({
                  message: "Signup successful",
                  user: user,
                  userId: user._id,
                });
                console.log("User Registered and Authenticated");
              });
            });
          }
        }
      );
    }
  });
});

// Route handles changing user data upon request
router.post("/changeUserData", async (req, res) => {
  const userID = req.body.data.userId;
  const profileDesc = req.body.profileDesc;
  const profileImage = req.body.profileImage;
  const fName = req.body.fName;
  const lName = req.body.lName;
  console.log(req.body.profileImage);

  try {
    const user = await User.findById(userID);
    console.log(user);

    if (!user) {
      return null;
    }

    user.profileDesc = profileDesc;
    user.profileImage = profileImage;
    user.fName = fName;
    user.lName = lName;
    await user.save();

    res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
  }
});

// Route handles logging out
router.post("/logout", (req, res) => {
  console.log("LOGGING OUT");
  req.logout((err) => {
    if (err) {
      // Handle error
      console.error(err);
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy(); // Destroy the session
    res.status(200).json({ message: "Logout successful" });
  });
});

module.exports = router;
