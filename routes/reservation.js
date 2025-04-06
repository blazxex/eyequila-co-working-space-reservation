const express = require("express");

const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservation,
  editReservation,
  cancelReservation,
} = require("../controllers/reservation.js");

const { protect, authorize } = require("../middleware/auth");
const { checkReservationConflict } = require("../middleware/reservation");

router.route("/").get(protect, getReservations);

router
  .route("/:RoomId")
  .post(protect, checkReservationConflict, createReservation);
router
  .route("/:id")
  .get(protect, getReservation)
  .put(editReservation)
  .delete(cancelReservation);

module.exports = router;
