const { User } = require('../models/User')


//@desc      Get current logged in user
//@route     POST /api/v1/auth/me
//@access    Private
exports.getMe = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};
