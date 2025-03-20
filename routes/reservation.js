const express = require("express");

const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservation,
  editReservation,
  cancelReservation
} = require('../controllers/reservation.js')

router.route('/').get(getReservations).post(createReservation);
router.route('/:id').get(getReservation).put(editReservation).delete(cancelReservation);

module.exports = router;
