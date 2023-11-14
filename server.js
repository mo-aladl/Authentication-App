require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/DBconn");

connectDB();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/usersRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err.message);
});
