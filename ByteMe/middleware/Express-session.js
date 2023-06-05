require("dotenv").config();

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
});

module.exports = sessionMiddleware;
