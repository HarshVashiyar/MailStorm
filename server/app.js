require("dotenv").config();
const PORT = process.env.PORT || 8080;
const mongo_URI = process.env.MONGO_URI;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const staticRouter = require("./routes/staticRouter");
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:5173'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api", staticRouter);
app.get("/", (req, res) => {
  res.send("Welcome to Main Backend Server!");
});

mongoose
  .connect(mongo_URI)
  .then(() => {
    console.log("Connected to database successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
