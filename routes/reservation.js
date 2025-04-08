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
router
  .route("/:id")
  .get(getReservation)
  .put(editReservation)
  .delete(cancelReservation);
router.get("/:reservationId/qr", protect, getReservationQR);
router.get("/verify", verifyQRCode);
module.exports = router;
