const User = require("../models/User");
const Space = require("../models/WorkingSpace");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

exports.getReservation = async (req, res) => {
  try {
    const currentTime = new Date();
    const reservation = await Reservation.findById(
      req.params.reservationId
    ).populate("room");
    if (!reservation || reservation.endTime <= currentTime) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found or expired." });
    }
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this reservation.",
      });
    }
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot retrieve reservation" });
  }
};
exports.getReservations = async (req, res) => {
  try {
    const currentTime = new Date();
    console.log(req.user);
    const filter =
      req.user.role !== "admin"
        ? { user: req.user.id, endTime: { $gt: currentTime } }
        : { endTime: { $gt: currentTime } };

    const reservations = await Reservation.find(filter).populate("room");

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot retrieve reservations",
    });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    console.log(startDateTime);

    // TODO : handle same user reserve consecutive

    // ✅ Check invalid reservation
    if (startDateTime >= endDateTime) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
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
    const reservationDuration =
      (endDateTime - startDateTime) / (1000 * 60 * 60); // Convert to hours
    if (reservationDuration > workspace.reservationHourLimit) {
      return res
        .status(400)
        .json({ message: "Reservation cannot exceed 2 hours" });
    }

    // Validate Timeboxing (Must be full-hour slots, at least 1 hour)
    if (
      startDateTime.getMinutes() !== 0 ||
      endDateTime.getMinutes() !== 0 ||
      reservationDuration < 1
    ) {
      return res
        .status(400)
        .json({ message: "Reservations must be at least 1-hour slots" });
    }

    // Check for Overlapping Reservations
    const overlappingReservation = await Reservation.findOne({
      roomId,
      $or: [
        { startDate: { $lt: endDateTime }, endDate: { $gt: startDateTime } }, // Overlapping condition
      ],
    });

    if (overlappingReservation) {
      return res.status(400).json({ message: "Time slot is already reserved" });
    }

    // If workspace is open 24 hours, no need to check time constraints
    if (!workspace.is24Hours) {
      const [openHour, openMinute] = workspace.openTime.split(":").map(Number);
      const [closeHour, closeMinute] = workspace.closeTime
        .split(":")
        .map(Number);

      // Convert working hours to Date objects for precise comparison
      const openDateTime = new Date(startDateTime);
      openDateTime.setHours(openHour, openMinute, 0, 0);

      const closeDateTime = new Date(startDateTime);
      closeDateTime.setHours(closeHour, closeMinute, 0, 0);

      if (startDateTime < openDateTime || endDateTime > closeDateTime) {
        return res
          .status(400)
          .json({ message: "Reservation must be within working hours" });
      }

      // Check if the reservation falls on open days
      const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const reservationDay = weekdays[startDateTime.getDay()];

      if (!workspace.openDays.includes(reservationDay)) {
        return res
          .status(400)
          .json({ message: "Workspace is closed on the selected day" });
      }
    }

    // Save the Reservation
    const newReservation = new Reservation({
      room: roomId,
      user: req.user.id,
      startDate: startDateTime,
      endDate: endDateTime,
    });
    await newReservation.save();

    return res
      .status(201)
      .json({ message: "Reservation created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// @desc    Update a reservation
// @route   PUT /reservations/:reservationId
// @access  Registered User (Owner) / Admin
exports.editReservation = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    let reservation = await Reservation.findById(req.params.reservationId);

    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
    }
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reservation.",
      });
    }

    if (startTime && endTime) {
      const newStartTime = new Date(startTime);
      const newEndTime = new Date(endTime);
      if (newStartTime >= newEndTime) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time.",
        });
      }
      if (
        !(
          [0, 30].includes(newStartTime.getMinutes()) &&
          [0, 30].includes(newEndTime.getMinutes())
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Start and end times must be on the hour or half-hour.",
        });
      }
      reservation.startTime = newStartTime;
      reservation.endTime = newEndTime;
    }

    reservation = await reservation.save();
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot update reservation" });
  }
};
// @desc    Delete a reservation
// @route   DELETE /reservations/:reservationId
// @access  Registered User (Owner) / Admin
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
    }
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reservation.",
      });
    }
    await reservation.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Reservation deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot delete reservation" });
  }
};
