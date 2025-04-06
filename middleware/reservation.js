const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const WorkingSpace = require("../models/WorkingSpace");

exports.checkReservationConflict = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const reservationId = req.params.id || null;
    const room = req.query;
    if (!room || !startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "room, startTime, and endTime are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "startTime must be before endTime" });
    }

    // STEP 1: Check room exists and populate its WorkingSpace
    const roomData = await Room.findById(room).populate("space");

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    const workingSpace = roomData.space;

    if (!workingSpace) {
      return res.status(404).json({ message: "Working space not found" });
    }

    // STEP 2: Check if the reservation time is within working space's open and close hours
    const openTimeStr = workingSpace.openTime; // e.g., "08:00"
    const closeTimeStr = workingSpace.closeTime; // e.g., "20:00"

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const [openHour, openMin] = openTimeStr.split(":").map(Number);
    const [closeHour, closeMin] = closeTimeStr.split(":").map(Number);

    const openTime = openHour + openMin / 60;
    const closeTime = closeHour + closeMin / 60;

    if (startHour < openTime || endHour > closeTime) {
      return res.status(400).json({
        message: `Reservation must be within working hours: ${openTimeStr} - ${closeTimeStr}`,
      });
    }

    // STEP 3: Check for conflicting reservations in the same room
    const conflict = await Reservation.findOne({
      room,
      _id: { $ne: reservationId }, // Exclude if editing
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Time slot already booked for this room.",
      });
    }

    next();
  } catch (error) {
    console.error("Conflict Check Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
