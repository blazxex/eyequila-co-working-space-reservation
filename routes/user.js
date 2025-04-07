const express = require("express");

const { getMe, changeProfile } = require("../controllers/user.js");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/me").get(protect, getMe).post(protect, changeProfile);

module.exports = router;
