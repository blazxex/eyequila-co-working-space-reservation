const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from cookies
  console.log(req.cookies.token);
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log(token);
  }

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    // console.log(req.user);
    next();
  } catch (err) {
    console.log(err.stack);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
