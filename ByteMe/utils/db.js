require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB CONNECTED");
  } catch (error) {
    console.log("DB CONNECTION ERROR", error);
  }
};

module.exports = connectDB;
