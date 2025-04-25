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
const {
  reservationValidator,
} = require("../middleware/validator/reservation.validator.js");
const validate = require("../middleware/validator/validate.js");

router
  .route("/")
  .get(protect, getReservations)
  .post(protect, reservationValidator, validate, createReservation);
router.get("/verify", verifyQRCode);
router
  .route("/:reservationId")
  .get(protect, getReservation)
  .put(protect, reservationValidator, validate, editReservation)
  .delete(protect, cancelReservation);
router.get("/:reservationId/qr", protect, getReservationQR);

module.exports = router;
