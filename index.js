// MIDDLEWARE
_passport = require("./ByteMe/middleware/Passport");
sessionMiddleware = require("./ByteMe/middleware/Express-session");

// DB
const connectDB = require("./ByteMe/utils/db");
connectDB();

// Express
const express = require("express");

// Morgan and Cors
const morgan = require("morgan");
const cors = require("cors");

// ROUTES
const postRoutes = require("./ByteMe/routes/Posts");
const userRoutes = require("./ByteMe/routes/User");

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

// Express-session middleware
app.use(sessionMiddleware);

// PASSPORT
app.use(_passport.initialize());
app.use(_passport.session());

// Routes for Post related routes
app.use(postRoutes);
app.use(userRoutes);

const port = process.env.PORT || 8080; // Use environment variable or default to 3000

app.listen(port, () => {
  console.log(`Server is listening on port 8080`);
});
