const User = require("../models/user");
const bcrypt = require("bcrypt");
const { response } = require("express");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { frist_name, last_name, email, password } = req.body;

  if (!frist_name || !last_name || !email || !password) {
    return res.status(400).json({ message: " All Fields Required" });
  }

  const foundUser = await User.findOne({ email: email }).exec();

  if (foundUser) {
    return res.status(401).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    frist_name,
    last_name,
    email,
    password: hashedPassword,
  });
  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: newUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: newUser._id,
      },
    },
    process.env.REFRSH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(201).json({
    accessToken,
    email: newUser.email,
    frist_name: newUser.frist_name,
    last_name: newUser.last_name,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: " All Fields Required" });
  }

  const foundUser = await User.findOne({ email: email }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User Does Not exists" });
  }
  const matchPassword = await bcrypt.compare(password, foundUser.password);
  if (!matchPassword) {
    return res.status(401).json({ message: "Worng Password" });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
      },
    },
    process.env.REFRSH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(201).json({
    accessToken,
    email: foundUser.email,
    frist_name: foundUser.frist_name,
    last_name: foundUser.last_name,
  });
};
const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const foundUser = await User.findById(decoded.UserInfo.id).exec();
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.json({ accessToken });
    }
  );
};
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
