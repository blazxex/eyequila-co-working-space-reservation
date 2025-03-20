const express = require("express");
const router = express.Router();

const reservation = require('../routes/reservation');
const { getRooms } = require("../controllers/room");

router.route('/:RoomId/reservation/', reservation);

router.route('/').get(getRooms);

module.exports = router;
