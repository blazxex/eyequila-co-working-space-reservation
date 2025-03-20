const User = require('../models/User')
const Space = require('../models/WorkingSpace')

exports.getReservations = async (req, res) => {
  // TODO: dynamic data between user and admin req
}
exports.getReservation = async (req, res) => {
  // TODO: dynamic data between user and admin req
}
exports.createReservation = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const { spaceId, roomId } = req.params;

    if (!roomId || !startTime || !endTime || !spaceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    if (newStartTime >= newEndTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // ✅ 1️⃣ Validate Timeboxing (Must be full-hour slots)
    if (
      newStartTime.getMinutes() !== 0 || newEndTime.getMinutes() !== 0 ||
      (newEndTime - newStartTime) !== 60 * 60 * 1000
    ) {
      return res.status(400).json({ message: "Reservations must be in 1-hour slots (e.g., 12:00 - 13:00)" });
    }

    // Check for Overlapping Reservations
    const overlappingReservation = await Reservation.findOne({
      roomId,
      $or: [
        { startTime: { $lt: newEndTime }, endTime: { $gt: newStartTime } } // Overlapping condition
      ]
    });

    if (overlappingReservation) {
      return res.status(400).json({ message: "Time slot is already reserved" });
    }

    // 2️⃣ Check Workspace Open and Close Hours
    const workspace = await Space.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    //const workspaceOpen = new Date(newStartTime);
    //const workspaceClose = new Date(newStartTime);
    const [openHour, openMinute] = workspace.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = workspace.closeTime.split(":").map(Number);

    workspaceOpen.setHours(openHour, openMinute, 0, 0);
    workspaceClose.setHours(closeHour, closeMinute, 0, 0);

    if (newStartTime < workspaceOpen || newEndTime > workspaceClose) {
      return res.status(400).json({ message: "Reservation must be within working hours" });
    }

    // Save the Reservation
    const newReservation = new Reservation({
      room: roomId,
      user: user.id,
      startTime: newStartTime,
      endTime: newEndTime
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
