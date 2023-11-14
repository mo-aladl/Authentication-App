const User = require("../models/user");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users.length) {
    return res.status(404).json({ message: "No users found" });
  }
  return res.status(200).json({ users: users });
};
module.exports = {
  getAllUsers,
};
