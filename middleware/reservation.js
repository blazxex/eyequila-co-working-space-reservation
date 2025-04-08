const Room = require("../models/Room");
const Space = require("../models/WorkingSpace");
const Reservation = require("../models/Reservation");

exports.checkReservationConstraints = async ({
  roomId,
  startTime,
  endTime,
  capacity,
  reservationId = null, // optional for edit
}) => {
  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);

  if (startDateTime >= endDateTime) {
    throw new Error("End time must be after start time");
  }

  if (
    startDateTime.getMinutes() !== 0 ||
    endDateTime.getMinutes() !== 0 ||
    (endDateTime - startDateTime) / (1000 * 60 * 60) < 1
  ) {
    throw new Error("Reservations must be full-hour slots and at least 1 hour");
  }

  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  if (capacity > room.capacity) {
    throw new Error(
      `Requested capacity exceeds room limit. Max: ${room.capacity}`
    );
  }

  const workspace = await Space.findById(room.space);
  if (!workspace) throw new Error("Workspace not found");

  const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
  if (durationHours > workspace.reservationHourLimit) {
    throw new Error("Reservation exceeds maximum allowed duration");
  }

  if (!workspace.is24Hours) {
    const [openHour, openMinute] = workspace.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = workspace.closeTime.split(":").map(Number);

    const openTime = new Date(startDateTime);
    openTime.setHours(openHour, openMinute, 0, 0);
    const closeTime = new Date(startDateTime);
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    if (startDateTime < openTime || endDateTime > closeTime) {
      throw new Error("Reservation must be within workspace hours");
    }

    const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const day = weekdays[startDateTime.getDay()];
    if (!workspace.openDays.includes(day)) {
      throw new Error("Workspace is closed on the selected day");
    }
  }

  // Check overlapping reservations (exclude current reservation if editing)
  const overlapFilter = {
    room: roomId,
    startTime: { $lt: endDateTime },
    endTime: { $gt: startDateTime },
  };

  if (reservationId) {
    overlapFilter._id = { $ne: reservationId };
  }

  const overlapping = await Reservation.findOne(overlapFilter);
  if (overlapping) throw new Error("Time slot is already reserved");

  return { room, workspace, startDateTime, endDateTime };
};
