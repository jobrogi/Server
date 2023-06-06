const express = require("express");
const router = express.Router();

const Post = require("../utils/userModel").Post;
const User = require("../utils/userModel").User;

const mongoose = require("mongoose");

// This route when called will get ALL user posts and send it back to the
// client side!
router.get("/getFeed", async (req, res) => {
  // USE THIS TO DELETE ALL POSTS
  //   Post.deleteMany({})
  //     .then(() => {
  //       console.log("All user documents deleted.");
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  try {
    // Retrieve posts with the specified user ID
    const posts = await Post.find().populate("user");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

// This route is responsible for updating the reposts of a post
router.post("/updateReposts", async (req, res) => {
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

// Route gets all user logged in liked posts
router.post("/getUserLikedPosts", async (req, res) => {
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

// Route gets all logged in users posts
router.post("/getUserPosts", async (req, res) => {
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

// Route is used for getting logged in users reposts
router.post("/getUserReposts", async (req, res) => {
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

// Route is used to gather liked posts of another user
router.get("/getUserLikedPosts/:username", async (req, res) => {
  const username = req.params.username;

  // Handle the request based on the username
  // You can retrieve user data from a database, for example
  // and send a response accordingly
  res.send(`You requested the profile of user: ${username}`);
});

// Route is used to gather reposted posts of another user
router.get("/getUserReposts/:username", async (req, res) => {
  const username = req.params.username;

  // Handle the request based on the username
  // You can retrieve user data from a database, for example
  // and send a response accordingly
  res.send(`You requested the profile of user: ${username}`);
});

// Route is used to gather posts of another user
router.get("/getUserPosts/:username", async (req, res) => {
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

// Route updates users likes
router.post("/updateLikes", async (req, res) => {
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

// route will add a new post to DB
router.post("/post", async (req, res) => {
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

// Route will delete a post from the DB
router.post("/deletePost", async (req, res) => {
  const { postId, username } = req.body;

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

module.exports = router;
