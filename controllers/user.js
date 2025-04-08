const { User } = require("../models/User");

exports.changeProfile = async (req, res) => {
  const { name, phoneNumber } = req.body;
  if (!name || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "invalid input",
    });
  }
  const user = req.user;
  user.profile = {
    name: name,
    phoneNumber: phoneNumber,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "update user name and phoneNumber successfully",
  });
};

//@desc      Get current logged in user
//@route     POST /api/v1/auth/me
//@access    Private
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};
