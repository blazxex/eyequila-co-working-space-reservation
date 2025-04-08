const { User } = require('../models/User')

exports.changeProfile = async (req, res) => {
  try {

    const { name, phoneNumber } = req.body;
    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "invalid input"
      })
    }
    const user = req.user;
    user.name = name;
    user.phoneNumber = phoneNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: "update user name and phoneNumber successfully",
      data: user
    })
  }
  catch (err) {
    console.log(err.message);
  }
}

//@desc      Get current logged in user
//@route     POST /api/v1/auth/me
//@access    Private
exports.getMe = async (req, res) => {
  console.log(req.user);
  res.status(200).json({
    success: true,
    data: req.user,
  });
};
