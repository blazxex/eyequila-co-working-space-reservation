const express = require("express");

const { register, login, logout, ge } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
