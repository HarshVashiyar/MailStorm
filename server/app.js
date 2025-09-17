require("dotenv").config();
const PORT = process.env.PORT || 8080;
const mongo_URI = process.env.MONGO_URI;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const staticRouter = require("./routes/staticRouter");
const path = require("path");

app.use(
  cors({
    origin: [
      "https://admin-func-front-vashiyarharshs-projects.vercel.app/",
      "https://admin-func-front-git-main-vashiyarharshs-projects.vercel.app/",
      "https://admin-func-front.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api", staticRouter);
app.get("/", (req, res) => {
  res.send("Hello World");
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
