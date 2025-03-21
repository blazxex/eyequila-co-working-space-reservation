const express = require("express");

const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservation,
  editReservation,
  cancelReservation,
  getReservationQR,
  verifyQRCode,
} = require("../controllers/reservation.js");

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getReservations)
  .post(protect, createReservation);

router
  .route("/:id")
  .get(protect, getReservation)
  .put(editReservation)
  .delete(cancelReservation);
router.get("/:reservationId/qr", protect, getReservationQR);
router.get("/verify", verifyQRCode);
module.exports = router;
