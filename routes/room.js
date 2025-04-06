const express = require("express");
const router = express.Router({ mergeParams: true });

const reservation = require("../routes/reservation");
const { getRooms, getRoom } = require("../controllers/room");

router.route("/").get(getRooms);

router.post("/:RoomId/reservation/", reservation);
router.get("/:RoomId", getRoom);

module.exports = router;
