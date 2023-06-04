// Imports / Requires
const { handleUserPost } = require("./utils/utils");

// Schemas
const User = require("./utils/userModel").User;
const Post = require("./utils/userModel").Post;

// ENV File
require("dotenv").config();

// Express / session
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

// Morgan and Cors
const morgan = require("morgan");
const cors = require("cors");

// Passport and Mongoose
const passport = require("passport");
const mongoose = require("mongoose");

// body parser
const bodyParser = require("body-parser");

// App
const app = express();
// const { Schema } = mongoose;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, // Allow cookies/session to be sent
  })
);

// Session
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
    const MongoDBStore = require("connect-mongodb-session")(session);

    store.on("error", function (error) {
      console.log("Session store error:", error);
    });
  })
  .catch((err) => console.log("DB CONNECTION ERROR", err));

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// for now just send whatever post data there is
app.get("/getFeed", async (req, res) => {
  try {
    // Retrieve posts with the specified user ID
    const posts = await Post.find().populate("user");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

// Get searched user Post data ////////////////////////////////////////////////////////////////
app.get("/getUserLikedPosts/:username", async (req, res) => {
  const username = req.params.username;

  // Handle the request based on the username
  // You can retrieve user data from a database, for example
  // and send a response accordingly
  res.send(`You requested the profile of user: ${username}`);
});
app.get("/getUserReposts/:username", async (req, res) => {
  const username = req.params.username;

  // Handle the request based on the username
  // You can retrieve user data from a database, for example
  // and send a response accordingly
  res.send(`You requested the profile of user: ${username}`);
});
app.get("/getUserPosts/:username", async (req, res) => {
  const username = req.params.username;
  const userData = JSON.parse(req.query.userData);
  const userID = userData._id;
  console.log(username + " || " + userData.username);

  // const userData = JSON.parse(req.query.userData);
  console.log("USER STUFF: ", userData);

  try {
    // Retrieve posts with the specified user ID
    const posts = await Post.find({ user: userID }).populate("user");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

// ////////////////////////////////////////////////////////////////////////////////////////////

// app.post("/getUserLikedPosts", async (req, res) => {
//   const data = req.body;
//   const userID = data.userData.userId;
//   console.log(data);
//   try {
//     const user = await User.findById(userID).populate("likedPosts");
//     console.log(user);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const likedPosts = user.likedPosts.map((post) => post.toObject());

//     res.status(200).json(likedPosts);
//   } catch (error) {
//     console.error("Error retrieving user liked posts:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

app.post("/getUserReposts", async (req, res) => {
  const data = req.body;
  console.log();
  const userID = data.userData.userId;
  // console.log("BODY " + req.body);
  console.log(userID);

  try {
    const user = await User.findById(userID).populate("reposts");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reposts = user.reposts.map((post) => post.toObject());

    res.status(200).json(reposts);
  } catch (error) {
    console.error("Error retrieving user liked posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/getUserPosts", async (req, res) => {
  const userData = req.body.userData;
  // console.log("!!!!!!!!!!!!!!!!!!!!!!!" + userData.userId);
  const userID = new mongoose.Types.ObjectId(userData.userId);
  try {
    // Retrieve posts with the specified user ID
    const posts = await Post.find({ user: userID }).populate("user");
    // console.log(posts);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

// Get user Post data ////////////////////////////////////////////////////////////////
app.post("/getUserLikedPosts", async (req, res) => {
  const data = req.body;
  const userID = data.userData.userId;
  console.log(data);
  try {
    const user = await User.findById(userID).populate("likedPosts").exec();
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const likedPosts = user.likedPosts.map((post) => post.toObject());

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error retrieving user liked posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/signUp", (req, res) => {
  // console.log('Sign up requested.')
  console.log(req.body);

  const _username = req.body.username.toLowerCase();
  const _fName = req.body.fName.toLowerCase();
  const _lName = req.body.lName.toLowerCase();
  const _email = req.body.email.toLowerCase();

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
            res.status(400).send(err.message);
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
///////////////////////////////////////////////////////////////////////////////////

app.post("/logIn", (req, res) => {
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

app.post("/changeUserData", async (req, res) => {
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

app.post("/logout", (req, res) => {
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

app.post("/updateReposts", async (req, res) => {
  const postId = new mongoose.Types.ObjectId(req.body.postId);
  const updatedRepost = req.body.reposts;
  const userId = new mongoose.Types.ObjectId(req.body.userId);
  console.log(req.body);

  // // Update the Posts Reposts
  Post.findByIdAndUpdate(postId, { reposts: updatedRepost }, { new: true })
    .then((updatedPost) => {
      if (updatedPost) {
        // The post was found and updated successfully
        console.log("Post reposts updated:");
        // Handle any further actions or send a response to the client
      } else {
        // The post was not found
        console.log("Post not found");
        // Handle the case where the post doesn't exist or handle the error
      }
    })
    .catch((error) => {
      // An error occurred while updating the post
      console.log("Error updating post reposts:", error);
      // Handle the error and send an error response to the client
    });

  // // Update the users Reposted Posts
  try {
    const user = await User.findById(userId);

    if (user) {
      // Check if the post already exists in the user's reposts array
      const isReposted = user.reposts.includes(postId);
      console.log(
        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + isReposted
      );

      if (isReposted) {
        // Post is already reposted, remove it from the reposts array
        user.reposts = user.reposts.filter((id) => !id.equals(postId));

        console.log("UNREPOSTED! Removing");
      } else {
        // Post is not reposted, add it to the reposts array
        user.reposts.push(postId);
        console.log("REPOSTED! Adding");
      }

      // Save the updated user document
      await user.save();

      // Send the updated user object in the response if needed
      res.status(200).json({ user });
    } else {
      // The user was not found
      throw new Error("User not found");
    }
  } catch (error) {
    // An error occurred while updating the user's reposts
    console.log("Error updating user's reposts:", error);
    res.status(500).json({ error: "Failed to update reposts" });
  }
});

app.post("/updateLikes", async (req, res) => {
  // Get the post that was liked and the new like count.
  // console.log("!!!!!!!!!!!!!!!!!!!!!!!!! " + JSON.stringify(req.body));
  const postId = new mongoose.Types.ObjectId(req.body.postId);
  // console.log(postId);
  const updatedLikes = req.body.likes;
  const userId = new mongoose.Types.ObjectId(req.body.userId);
  console.log(userId);

  // Update the Posts Likes.
  Post.findByIdAndUpdate(postId, { likes: updatedLikes }, { new: true })
    .then((updatedPost) => {
      if (updatedPost) {
        // The post was found and updated successfully
        console.log("Post likes updated");
        // Handle any further actions or send a response to the client
      } else {
        // The post was not found
        console.log("Post not found");
        // Handle the case where the post doesn't exist or handle the error
      }
    })
    .catch((error) => {
      // An error occurred while updating the post
      console.log("Error updating post likes:", error);
      // Handle the error and send an error response to the client
    });

  // Update the users Liked Posts
  // try {
  //   const user = await User.findById(userId);

  //   if (user) {
  //     // Check if the post already exists in the user's likedPosts array
  //     const isLiked = user.likedPosts.includes(postId);
  //     console.log(
  //       "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + isLiked
  //     );

  //     if (isLiked) {
  //       // Post is already liked, remove it from the likedPosts array
  //       user.likedPosts = user.likedPosts.filter((id) => !id.equals(postId));

  //       console.log("UNLIKED! Removing");
  //     } else {
  //       // Post is not liked, add it to the likedPosts array
  //       user.likedPosts.push(postId);
  //       console.log("LIKED! Adding");
  //     }

  //     // Save the updated user document
  //     await user.save();

  //     // Send the updated user object in the response if needed
  //     res.status(200).json({ user });
  //   } else {
  //     // The user was not found
  //     throw new Error("User not found");
  //   }
  // } catch (error) {
  //   // An error occurred while updating the user's likedPosts
  //   console.log("Error updating user's likedPosts:", error);
  //   res.status(500).json({ error: "Failed to update likedPosts" });
  // }
  try {
    const user = await User.findById(userId);

    if (user) {
      const isLiked = user.likedPosts.indexOf(postId) !== -1;

      if (isLiked) {
        // Post is already liked, remove it from the likedPosts array
        user.likedPosts = user.likedPosts.filter((id) => !id.equals(postId));
        console.log("UNLIKED! Removing");
      } else {
        // Post is not liked, add it to the likedPosts array
        user.likedPosts.push(postId);
        console.log("LIKED! Adding");
      }

      // Save the updated user document
      await user.save();

      // Send the updated user object in the response if needed
      res.status(200).json({ user });
    } else {
      // The user was not found
      throw new Error("User not found");
    }
  } catch (error) {
    // An error occurred while updating the user's likedPosts
    console.log("Error updating user's likedPosts:", error);
    res.status(500).json({ error: "Failed to update likedPosts" });
  }
});

app.post("/post", async (req, res) => {
  const username = req.body.username.toLowerCase();
  const imageData = req.body.imageData;
  const postDesc = req.body.postDesc;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      // If user not found, send an error response
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new post using the Post model
    const post = new Post({
      user: user._id, // Set the user reference
      imageData: imageData,
      postDesc: postDesc,
    });

    // Save the new post
    await post.save();

    // If the post is successfully added, send a 200 response
    res.status(200).json({ message: "Post added successfully" });
  } catch (error) {
    // If an error occurs, send an error response
    res.status(500).json({ error: "Failed to add post" });
  }
});

app.post("/deletePost", async (req, res) => {
  const username = req.body.username;
  const postId = req.body.postId;

  try {
    // Find the post by its postId and remove it
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      // If the post doesn't exist, return an error response
      return res.status(404).json({ error: "Post not found" });
    }

    // Optionally, you can remove the postId from the user's likedPosts array
    // Assuming you have a User model with the likedPosts field
    const user = await User.findOne({ username });
    if (user) {
      user.likedPosts.pull(postId);
      await user.save();
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    // Handle the error
    console.log(error);
    return res.status(500).json({ error: "Failed to handle post deletion" });
  }
});

// LISTEN
const port = process.env.PORT || 8080; // Use environment variable or default to 3000

app.listen(port, () => {
  console.log(`Server is listening on port 8080`);
});
