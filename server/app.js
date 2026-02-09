require("dotenv").config();
const PORT = process.env.PORT || 8080;
const mongo_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const staticRouter = require("./routes/staticRouter");
const path = require("path");
const cookieParser = require("cookie-parser");
// const session = require('express-session');

// Trust the proxy to know about HTTPS
app.set('trust proxy', 1);

// Middleware to enforce HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
});

app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      FRONTEND_URL
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
//     httpOnly: true,
//     maxAge: 10 * 60 * 1000 // 10 minutes
//   }
// }));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api", staticRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Main Backend Server!");
});

mongoose
  .connect(mongo_URI)
  .then(() => {
    console.log("Connected to database successfully");
    console.log("Starting email workers...");
    require('./workers/emailWorker');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });