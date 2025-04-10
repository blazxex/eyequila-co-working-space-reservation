const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  createReservation,
  getReservations,
  getReservation,
  editReservation,
  cancelReservation,
  getReservationQR,
  verifyQRCode,
} = require("../controllers/reservation.js");
const { protect } = require("../middleware/auth.js");
const { getMe } = require("../controllers/user.js");

router
  .route("/")
  .get(protect, getReservations)
  .post(protect, createReservation);
router.get("/verify", verifyQRCode);
router
  .route("/:reservationId")
  .get(protect, getReservation)
  .put(protect, editReservation)
  .delete(protect, cancelReservation);
router.get("/:reservationId/qr", protect, getReservationQR);

module.exports = router;
