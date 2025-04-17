const express = require("express");

const { register, login, logout } = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const { registerValidator } = require("../middleware/validator/register.validator");
const validate = require("../middleware/validator/validate.js")
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
