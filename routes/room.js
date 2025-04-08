const express = require("express");
const router = express.Router({ mergeParams: true });

const reservation = require("../routes/reservation");
const { getRooms, getRoom } = require("../controllers/room");

router.route("/").get(getRooms);
router.route("/:id").get(getRoom);

router.use("/:roomId/reservation", reservation);

module.exports = router;
