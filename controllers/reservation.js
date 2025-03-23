const User = require('../models/User')
const Space = require('../models/WorkingSpace')
const Room = require('../models/Room')
const Reservation = require('../models/Reservation')

exports.getReservations = async (req, res) => {
  // TODO: dynamic data between user and admin req
}
exports.getReservation = async (req, res) => {
  // TODO: dynamic data between user and admin req
}


exports.createReservation = async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // TODO : handle same user reserve consecutive

    // ✅ Check invalid reservation
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Check if Room Exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check Workspace Open and Close Hours
    const workspace = await Space.findById(room.space);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Limit reservation duration to a maximum hour limit
    const reservationDuration = (endDateTime - startDateTime) / (1000 * 60 * 60); // Convert to hours
    if (reservationDuration > workspace.reservationHourLimit) {
      return res.status(400).json({ message: "Reservation cannot exceed 2 hours" });
    }

    // Validate Timeboxing (Must be full-hour slots, at least 1 hour)
    if (
      startDateTime.getMinutes() !== 0 ||
      endDateTime.getMinutes() !== 0 ||
      reservationDuration < 1
    ) {
      return res.status(400).json({ message: "Reservations must be at least 1-hour slots" });
    }


    // Check for Overlapping Reservations
    const overlappingReservation = await Reservation.findOne({
      roomId,
      $or: [
        { startDate: { $lt: endDateTime }, endDate: { $gt: startDateTime } } // Overlapping condition
      ]
    });

    if (overlappingReservation) {
      return res.status(400).json({ message: "Time slot is already reserved" });
    }

    // If workspace is open 24 hours, no need to check time constraints
    if (!workspace.is24Hours) {
      const [openHour, openMinute] = workspace.openTime.split(":").map(Number);
      const [closeHour, closeMinute] = workspace.closeTime.split(":").map(Number);

      // Convert working hours to Date objects for precise comparison
      const openDateTime = new Date(startDateTime);
      openDateTime.setHours(openHour, openMinute, 0, 0);

      const closeDateTime = new Date(startDateTime);
      closeDateTime.setHours(closeHour, closeMinute, 0, 0);

      if (startDateTime < openDateTime || endDateTime > closeDateTime) {
        return res.status(400).json({ message: "Reservation must be within working hours" });
      }

      // Check if the reservation falls on open days
      const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const reservationDay = weekdays[startDateTime.getDay()];

      if (!workspace.openDays.includes(reservationDay )) {
        return res.status(400).json({ message: "Workspace is closed on the selected day" });
      }
    }

    // Save the Reservation
    const newReservation = new Reservation({
      room: roomId,
      user: req.user.id,
      startDate: startDateTime,
      endDate:endDateTime 
    });
    await newReservation.save();

    return res.status(201).json({ message: "Reservation created successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
exports.editReservation = async (req, res) => {
  return res.sendstatus(200);
}
exports.cancelReservation = async (req, res) => {
  return res.sendstatus(200);
}
