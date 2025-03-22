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

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    console.log(newStartDate.getMinutes());
    console.log(newEndDate.getMinutes());
    console.log((newEndDate - newStartDate));

    if (newStartDate >= newEndDate) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // ✅ Validate Timeboxing (Must be full-hour slots)

    if (
      newStartDate.getMinutes() !== 0 ||
      newEndDate.getMinutes() !== 0 ||
      (newEndDate - newStartDate) % 60 * 60 * 1000 !== 0 ||
      (newEndDate - newStartDate) < 60 * 60 * 1000
    ) {
      return res.status(400).json({ message: "Reservations must be atleast 1-hour slots" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        message: "Can not find this room"
      })
    }

    // Check for Overlapping Reservations
    const overlappingReservation = await Reservation.findOne({
      roomId,
      $or: [
        { startDate: { $lt: newEndDate }, endDate: { $gt: newStartDate } } // Overlapping condition
      ]
    });

    if (overlappingReservation) {
      return res.status(400).json({ message: "Time slot is already reserved" });
    }


    // Check Workspace Open and Close Hours
    const workspace = await Space.findById(room.space);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const startDateTime = new Date(newStartDate);
    const endDateTime = new Date(newEndDate);

    const [openHour, openMinute] = workspace.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = workspace.closeTime.split(":").map(Number);

    const workspaceOpen = new Date(startDateTime);
    workspaceOpen.setHours(openHour, openMinute, 0, 0);

    const workspaceClose = new Date(startDateTime);
    workspaceClose.setHours(closeHour, closeMinute, 0, 0);


    // Check if reservation falls outside workspace hours
    if (startDateTime < workspaceOpen || endDateTime > workspaceClose) {
      return res.status(400).json({ message: "Reservation must be within working hours" });
    }

    // Save the Reservation
    const newReservation = new Reservation({
      room: roomId,
      user: req.user.id,
      startDate: newStartDate,
      endDate: newEndDate
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
