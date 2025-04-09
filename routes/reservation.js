const express = require("express");

const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservation,
  editReservation,
  cancelReservation,
} = require("../controllers/reservation.js");
const { protect, authorize } = require("../middleware/auth.js");
const { getMe } = require("../controllers/user.js");

router
  .route("/")
  .get(protect, authorize('user', 'admin'), getReservations)
  .post(protect, authorize('user'), createReservation);
router
  .route("/:id")
  .get(protect, authorize('user', 'admin'), getReservation)
  .put(protect, authorize('user', 'admin'), editReservation)
  .delete(protect, authorize('user', 'admin'), cancelReservation);

module.exports = router;
