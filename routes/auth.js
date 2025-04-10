const express = require("express");

const { register, login, logout } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/logout", logout);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
