const User = require("../models/User");
const { admin, bucket } = require("../config/firebase");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public

exports.register = async (req, res, next) => {
  try {
    console.log("register");
    const { email, role } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    console.log(firebaseUid);

    // Create user
    const user = await User.create({
      email,
      firebaseUid,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }
  const idToken = authHeader.split(" ")[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const firebaseUid = decodedToken.uid;
  console.log(firebaseUid);

  if (!firebaseUid) {
    return res
      .status(400)
      .json({ success: false, msg: "Please provide firebaseUid" });
  }

  // Check for user
  const user = await User.findOne({ firebaseUid: firebaseUid });

  if (!user) {
    return res.status(400).json({ success: false, msg: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
};


exports.logout = async (req, res, next) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0) // Expire immediately
  });
  res.status(200).json({ message: 'Logged out successfully' });
}

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

