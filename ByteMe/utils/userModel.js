// Mongoose
const mongoose = require("mongoose");

// Passport
const passportLocalMongoose = require("passport-local-mongoose");

const commentsSchema = new mongoose.Schema({
  text: String,
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  imageData: [String], // Update to an array of strings
  postDesc: String,
  likes: { type: Number, default: 0 },
  reposts: { type: Number, default: 0 },
  // comments: [commentsSchema],
});

const Post = mongoose.model("Post", postSchema); // Create a separate Post model

const userSchema = new mongoose.Schema({
  username: String,
  fName: String,
  lName: String,
  dateOfBirth: { type: Date },
  email: String,
  password: String,
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  reposts: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    default: [],
  },
  profileImage: {
    type: String,
    default: "null", // Specify the default value here
  },
  profileDesc: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = { User, Post };
