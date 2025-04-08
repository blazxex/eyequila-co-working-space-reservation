const express = require("express");

const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservation,
  editReservation,
  cancelReservation,
} = require("../controllers/reservation.js");
const { protect } = require("../middleware/auth.js");
const { getMe } = require("../controllers/user.js");

router
  .route("/")
  .get(protect, getReservations)
  .post(protect, createReservation);
router
  .route("/:id")
  .get(getReservation)
  .put(editReservation)
  .delete(cancelReservation);

module.exports = router;
